import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

export function SearchFilters() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log("Search:", { search, category, location });
  };

  return (
    <section className="bg-white py-8 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search businesses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-3 rounded-full focus:ring-2 focus:ring-coral focus:border-transparent"
              />
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-48 rounded-full">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="restaurant">Restaurants</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="service">Services</SelectItem>
                <SelectItem value="health">Health & Beauty</SelectItem>
                <SelectItem value="fitness">Fitness</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-48 rounded-full">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Locations</SelectItem>
                <SelectItem value="downtown">Downtown</SelectItem>
                <SelectItem value="uptown">Uptown</SelectItem>
                <SelectItem value="midtown">Midtown</SelectItem>
                <SelectItem value="suburbs">Suburbs</SelectItem>
                <SelectItem value="arts-quarter">Arts Quarter</SelectItem>
                <SelectItem value="sports-district">Sports District</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleSearch}
              className="bg-coral text-white px-6 py-2 rounded-full hover:bg-coral-light"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
