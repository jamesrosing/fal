-- Chat conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON chat_conversations(user_id);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON chat_messages(created_at);

-- RLS Policies for chat_conversations
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

-- Users can view and insert their own conversations
CREATE POLICY "Users can view their own conversations" ON chat_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations" ON chat_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON chat_conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages in their conversations
CREATE POLICY "Users can view messages in their conversations" ON chat_messages
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT user_id FROM chat_conversations WHERE id = conversation_id
    )
  );

CREATE POLICY "Users can insert messages in their conversations" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT user_id FROM chat_conversations WHERE id = conversation_id
    )
  );

-- Service role can do everything
CREATE POLICY "Service role can do everything on chat_conversations" ON chat_conversations
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can do everything on chat_messages" ON chat_messages
  USING (auth.jwt() ->> 'role' = 'service_role');