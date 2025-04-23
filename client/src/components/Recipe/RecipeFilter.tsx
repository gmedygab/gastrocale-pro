import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RecipeFilter as RecipeFilterType, categoryOptions, subcategoryOptions } from "@shared/schema";

interface RecipeFilterProps {
  onFilterChange: (filter: RecipeFilterType) => void;
}

export default function RecipeFilter({ onFilterChange }: RecipeFilterProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [sortBy, setSortBy] = useState("");
  
  // Format display strings for options
  const formatOption = (str: string) => {
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Apply filters when any filter value changes
  useEffect(() => {
    const filter: RecipeFilterType = {};
    
    if (search) filter.search = search;
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (sortBy) filter.sortBy = sortBy as any;
    
    onFilterChange(filter);
  }, [search, category, subcategory, sortBy, onFilterChange]);
  
  // Reset all filters
  const handleReset = () => {
    setSearch("");
    setCategory("");
    setSubcategory("");
    setSortBy("");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" size={18} />
            <Input
              type="text"
              placeholder="Search recipes..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categoryOptions.map((cat) => (
                <SelectItem key={cat} value={cat}>{formatOption(cat)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={subcategory} onValueChange={setSubcategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {subcategoryOptions.map((subcat) => (
                <SelectItem key={subcat} value={subcat}>{formatOption(subcat)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sort By</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="cost_low">Cost: Low-High</SelectItem>
              <SelectItem value="cost_high">Cost: High-Low</SelectItem>
              <SelectItem value="margin">Profit Margin</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={handleReset} className="h-10 w-10">
            <Filter size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
