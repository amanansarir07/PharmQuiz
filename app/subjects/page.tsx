import Link from "next/link";
import { subjects } from "@/data/subjects";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowRight } from "lucide-react";

export default function SubjectsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">All Subjects</h1>
        <p className="mt-2 text-muted-foreground">
          D. Pharmacy 2nd Year — {subjects.length} subjects, {subjects.reduce((a, s) => a + s.units.length, 0)} units
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <Link key={subject.id} href={`/subjects/${subject.slug}`}>
            <Card className="h-full transition-all hover:shadow-md hover:border-primary/20 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{subject.icon}</span>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {subject.name}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {subject.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        <BookOpen className="mr-1 h-3 w-3" />
                        {subject.units.length} units
                      </Badge>
                      <Badge variant="outline">{subject.examMarks} marks</Badge>
                      <Badge variant="outline">{subject.totalHours} hrs</Badge>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      View units
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
