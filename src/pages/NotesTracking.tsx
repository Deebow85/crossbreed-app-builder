
import React, { useState } from "react";
import { Search, Folder, Plus, ChevronDown } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NotesTracking = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  return (
    <div className="p-4 flex flex-col h-full bg-white">
      <h1 className="text-2xl font-bold mb-4">Notes & Tracking</h1>
      
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          placeholder="Search notes or swaps..."
          className="pl-10 bg-white border rounded-md w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="notes">
        <TabsList className="grid grid-cols-2 mb-4 bg-gray-100">
          <TabsTrigger value="notes" className="data-[state=active]:bg-white">Notes</TabsTrigger>
          <TabsTrigger value="swap" className="data-[state=active]:bg-white">Shift Swap / TOIL</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notes">
          {/* Add Note Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Plus size={20} className="mr-2" />
                  <span>Add Note</span>
                </div>
                <ChevronDown size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Regular Note</DropdownMenuItem>
              <DropdownMenuItem>Calendar Note</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Notes Section */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Your Notes</h2>
            
            <div className="border rounded-md p-4 mb-4 flex justify-between items-center">
              <div className="flex items-center">
                <Folder size={20} className="text-gray-500 mr-2" />
                <span>Notes</span>
              </div>
              <span className="text-gray-500">0 items</span>
            </div>
            
            <div className="border rounded-md p-4 flex justify-between items-center">
              <div className="flex items-center">
                <Folder size={20} className="text-gray-500 mr-2" />
                <span>Notes From Calendar</span>
              </div>
              <span className="text-gray-500">0 items</span>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="swap">
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">No shift swaps or TOIL requests</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotesTracking;
