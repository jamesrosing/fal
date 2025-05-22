"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Search, SlidersHorizontal, X, Filter } from "lucide-react";
import Link from "next/link";

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

export interface GallerySidebarProps {
  title?: string;
  procedures?: FilterOption[];
  sortOptions?: FilterOption[];
  baseUrl: string;
  selectedProcedure?: string;
  selectedSort?: string;
  tags?: FilterOption[];
  surgeons?: FilterOption[];
  onFilter?: (filters: Record<string, string[]>) => void;
  collections?: {
    id: string;
    title: string;
    albums?: {
      id: string;
      title: string;
    }[];
  }[];
  currentCollection?: string;
  currentAlbum?: string;
}

export function GallerySidebar({
  title = "Filter Gallery",
  procedures = [],
  sortOptions = [],
  baseUrl,
  selectedProcedure,
  selectedSort,
  tags = [],
  surgeons = [],
  onFilter,
  collections = [],
  currentCollection,
  currentAlbum
}: GallerySidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get current filter values from URL params
  const currentProcedures = searchParams.get("procedures")?.split(",") || [];
  const currentTags = searchParams.get("tags")?.split(",") || [];
  const currentSurgeons = searchParams.get("surgeons")?.split(",") || [];
  const currentSort = searchParams.get("sort") || "newest";
  
  // Local state for filters
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>(currentProcedures);
  const [selectedTags, setSelectedTags] = useState<string[]>(currentTags);
  const [selectedSurgeons, setSelectedSurgeons] = useState<string[]>(currentSurgeons);
  const [sortOption, setSortOption] = useState<string>(currentSort);
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get("q") || "");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // Function to update URL with current filters
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (selectedProcedures.length > 0) {
      params.set("procedures", selectedProcedures.join(","));
    }
    
    if (selectedTags.length > 0) {
      params.set("tags", selectedTags.join(","));
    }
    
    if (selectedSurgeons.length > 0) {
      params.set("surgeons", selectedSurgeons.join(","));
    }
    
    if (sortOption && sortOption !== "newest") {
      params.set("sort", sortOption);
    }
    
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }
    
    // Update URL
    const url = baseUrl + (params.toString() ? `?${params.toString()}` : "");
    router.push(url);
    
    // Call onFilter callback if provided
    if (onFilter) {
      onFilter({
        procedures: selectedProcedures,
        tags: selectedTags,
        surgeons: selectedSurgeons,
        sort: [sortOption],
        q: searchQuery ? [searchQuery] : []
      });
    }
  };
  
  const resetFilters = () => {
    setSelectedProcedures([]);
    setSelectedTags([]);
    setSelectedSurgeons([]);
    setSortOption("newest");
    setSearchQuery("");
    
    // Update URL by removing all query params
    router.push(baseUrl);
    
    // Call onFilter callback if provided
    if (onFilter) {
      onFilter({
        procedures: [],
        tags: [],
        surgeons: [],
        sort: ["newest"],
        q: []
      });
    }
  };
  
  // Check if filters are active
  const isFiltersActive = 
    selectedProcedures.length > 0 || 
    selectedTags.length > 0 || 
    selectedSurgeons.length > 0 || 
    sortOption !== "newest" ||
    searchQuery.trim() !== "";
  
  // Toggle a filter value
  const toggleFilter = (type: "procedures" | "tags" | "surgeons", id: string) => {
    switch (type) {
      case "procedures":
        setSelectedProcedures(prev => 
          prev.includes(id) 
            ? prev.filter(item => item !== id) 
            : [...prev, id]
        );
        break;
      case "tags":
        setSelectedTags(prev => 
          prev.includes(id) 
            ? prev.filter(item => item !== id) 
            : [...prev, id]
        );
        break;
      case "surgeons":
        setSelectedSurgeons(prev => 
          prev.includes(id) 
            ? prev.filter(item => item !== id) 
            : [...prev, id]
        );
        break;
    }
  };
  
  const SidebarContent = () => (
    <div className="w-full h-full flex flex-col border rounded-lg">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-medium flex items-center">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          {title}
        </h2>
        {isFiltersActive && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs">
            <X className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>
      
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search gallery..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <Accordion type="multiple" defaultValue={["collections", "sort", "procedures", "tags", "surgeons"]} className="w-full">
          {collections.length > 0 && (
            <AccordionItem value="collections" className="border-b">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                Collections
              </AccordionTrigger>
              <AccordionContent className="px-4 py-2">
                <div className="space-y-1">
                  {collections.map((collection) => (
                    <div key={collection.id} className="space-y-1">
                      <Link 
                        href={`/gallery/${collection.id}`}
                        className={`block px-2 py-1.5 text-sm rounded-md ${
                          currentCollection === collection.id 
                            ? 'bg-accent text-accent-foreground font-medium' 
                            : 'hover:bg-accent/50 hover:text-accent-foreground'
                        }`}
                        onClick={() => setIsSheetOpen(false)}
                      >
                        {collection.title}
                      </Link>
                      
                      {collection.albums && collection.albums.length > 0 && currentCollection === collection.id && (
                        <div className="ml-4 space-y-1 mt-1 border-l-2 pl-2">
                          {collection.albums.map((album) => (
                            <Link
                              key={album.id}
                              href={`/gallery/${collection.id}/${album.id}`}
                              className={`block px-2 py-1 text-sm rounded-md ${
                                currentAlbum === album.id
                                  ? 'bg-accent/70 text-accent-foreground font-medium'
                                  : 'hover:bg-accent/30 hover:text-accent-foreground'
                              }`}
                              onClick={() => setIsSheetOpen(false)}
                            >
                              {album.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
          
          <AccordionItem value="sort" className="border-b">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              Sort By
            </AccordionTrigger>
            <AccordionContent className="px-4 py-2">
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>
          
          {procedures.length > 0 && (
            <AccordionItem value="procedures" className="border-b">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                Procedures
              </AccordionTrigger>
              <AccordionContent className="px-4 py-2">
                <div className="space-y-2">
                  {procedures.map((procedure) => (
                    <div key={procedure.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`procedure-${procedure.id}`} 
                        checked={selectedProcedures.includes(procedure.id)} 
                        onCheckedChange={() => toggleFilter("procedures", procedure.id)} 
                      />
                      <Label 
                        htmlFor={`procedure-${procedure.id}`}
                        className="text-sm flex-1 cursor-pointer"
                      >
                        {procedure.label}
                        {procedure.count !== undefined && (
                          <span className="text-muted-foreground text-xs ml-1">({String(procedure.count)})</span>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
          
          {tags.length > 0 && (
            <AccordionItem value="tags" className="border-b">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                Tags
              </AccordionTrigger>
              <AccordionContent className="px-4 py-2">
                <div className="space-y-2">
                  {tags.map((tag) => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`tag-${tag.id}`} 
                        checked={selectedTags.includes(tag.id)} 
                        onCheckedChange={() => toggleFilter("tags", tag.id)} 
                      />
                      <Label 
                        htmlFor={`tag-${tag.id}`}
                        className="text-sm flex-1 cursor-pointer"
                      >
                        {tag.label}
                        {tag.count !== undefined && (
                          <span className="text-muted-foreground text-xs ml-1">({String(tag.count)})</span>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
          
          {surgeons.length > 0 && (
            <AccordionItem value="surgeons" className="border-b">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                Surgeons
              </AccordionTrigger>
              <AccordionContent className="px-4 py-2">
                <div className="space-y-2">
                  {surgeons.map((surgeon) => (
                    <div key={surgeon.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`surgeon-${surgeon.id}`} 
                        checked={selectedSurgeons.includes(surgeon.id)} 
                        onCheckedChange={() => toggleFilter("surgeons", surgeon.id)} 
                      />
                      <Label 
                        htmlFor={`surgeon-${surgeon.id}`}
                        className="text-sm flex-1 cursor-pointer"
                      >
                        {surgeon.label}
                        {surgeon.count !== undefined && (
                          <span className="text-muted-foreground text-xs ml-1">({String(surgeon.count)})</span>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
      
      <div className="p-4 border-t">
        <Button 
          onClick={() => {
            applyFilters();
            setIsSheetOpen(false);
          }} 
          className="w-full"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="md:hidden mb-4">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {isFiltersActive && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:w-80">
            <SheetHeader>
              <SheetTitle>Gallery Filters</SheetTitle>
              <SheetDescription>
                Filter and sort gallery content to find what you're looking for.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 h-full">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <SidebarContent />
      </div>
    </>
  );
}
