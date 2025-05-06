# Chat System Implementation

This document outlines the implementation of the chat system for Allure MD, a modern LLM-powered chatbot designed to enhance customer experience.

## Architecture Overview

The chat system consists of the following components:

1. **Frontend Components**:
   - `ChatButton`: Floating chat button visible on all pages
   - `ChatContainer`: Main chat interface with message display
   - `ChatBubble`: Individual message bubbles for user and assistant messages
   - `ChatInput`: Input field for user messages

2. **Backend API**:
   - `/api/chat` endpoint for processing messages
   - OpenAI integration for generating responses
   - Supabase integration for storing conversation history

3. **Database Schema**:
   - `chat_conversations` table to track chat sessions
   - `chat_messages` table to store all messages

## Key Features

- **AI-Powered Responses**: Uses OpenAI's GPT-4 to generate contextually relevant responses
- **Contextual Understanding**: Maintains conversation context for natural interactions
- **Medical Knowledge**: Pre-trained with information about Allure MD's services and general medical knowledge
- **Appointment Scheduling**: Detects appointment scheduling intents and guides users through the process
- **Persistent Chat History**: Stores chat history for authenticated users
- **Multi-Device Support**: Users can continue conversations across devices when logged in

## Usage Examples

The chat system can handle various user intents, including:

1. **General Medical Questions**:
   - "What treatments do you offer for acne?"
   - "How long is recovery from rhinoplasty?"

2. **Appointment Scheduling**:
   - "I'd like to book an appointment"
   - "Can I see Dr. Rosing next week?"

3. **Practice Information**:
   - "What are your office hours?"
   - "Where are you located?"
   - "Do you accept insurance?"

## Technical Implementation

### Frontend

The chat UI is built using:
- Next.js for the framework
- Tailwind CSS for styling
- Framer Motion for animations
- React Hooks for state management

### Backend

The message processing system uses:
- Next.js API routes (Edge runtime)
- OpenAI API for message generation
- Supabase for data storage and user authentication

### Database

The database schema includes:
- Conversations table to group messages
- Messages table with role-based content
- Proper row-level security policies to ensure data privacy

## Setup Requirements

To use the chat system, you need:

1. **OpenAI API Key**: Set as `OPENAI_API_KEY` in your environment variables
2. **Supabase Project**: Configured with the provided database schema
3. **Authentication**: Working Supabase authentication system for user identification

## Future Enhancements

Planned enhancements for the chat system include:

1. **Advanced Appointment Integration**: Direct integration with the appointment booking system
2. **Custom Training**: Fine-tuned model with Allure MD specific information
3. **Rich Media Support**: Ability to share images and documents in chat
4. **Multi-Language Support**: Conversations in languages beyond English