
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { Note } from "@/types/calendar";
import { StickyNote, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotesTracking = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedNotes = localStorage.getItem('calendarNotes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  // Group notes by month
  const notesByMonth = notes.reduce((groups, note) => {
    const date = parseISO(note.date);
    const monthYear = format(date, 'MMMM yyyy');
    
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    
    groups[monthYear].push(note);
    return groups;
  }, {} as Record<string, Note[]>);

  // Sort months in reverse chronological order
  const sortedMonths = Object.keys(notesByMonth).sort((a, b) => {
    const dateA = parseISO(notesByMonth[a][0].date);
    const dateB = parseISO(notesByMonth[b][0].date);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notes Tracking</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/calendar')}
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Back to Calendar
        </Button>
      </div>
      
      {notes.length === 0 ? (
        <div className="text-center py-12">
          <StickyNote className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No notes found. Add notes by clicking on dates in the calendar.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/calendar')}
          >
            Go to Calendar
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedMonths.map((month) => (
            <div key={month}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {month}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notesByMonth[month]
                  .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
                  .map((note) => (
                    <Card key={note.date} className="overflow-hidden">
                      <CardHeader className="bg-muted/50 pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <StickyNote className="h-4 w-4" />
                          {format(parseISO(note.date), 'EEEE, MMMM d, yyyy')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="whitespace-pre-wrap">{note.text}</p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesTracking;
