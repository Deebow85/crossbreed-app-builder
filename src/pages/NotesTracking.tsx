
import React from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const NotesTracking = () => {
  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-4">Notes & Tracking</h1>
      
      <Tabs defaultValue="tracking">
        <TabsList className="mb-4">
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="tracking">
          <Card>
            <CardHeader>
              <CardTitle>Track Your Work</CardTitle>
              <CardDescription>
                Keep track of your work hours, overtime, and more.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium text-lg mb-2">Work Statistics</h3>
                  <p className="text-muted-foreground mb-4">View your work statistics for this month.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">Hours Worked</p>
                      <p className="text-xl font-bold">32.5</p>
                    </div>
                    <div className="bg-secondary p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">Overtime</p>
                      <p className="text-xl font-bold">4.0</p>
                    </div>
                    <div className="bg-secondary p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">Days Worked</p>
                      <p className="text-xl font-bold">8</p>
                    </div>
                    <div className="bg-secondary p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">Shifts Completed</p>
                      <p className="text-xl font-bold">10</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotesTracking;
