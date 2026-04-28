import { Users, Clock, Code2, BookOpen, Database, Globe, Cpu, Braces } from "lucide-react";

const classrooms = [
  {
    title: "Python Fundamentals",
    lang: "python",
    icon: Code2,
    students: 234,
    level: "Beginner",
    color: "text-primary",
  },
  {
    title: "JavaScript & DOM",
    lang: "javascript",
    icon: Braces,
    students: 189,
    level: "Intermediate",
    color: "text-accent",
  },
  {
    title: "Data Structures in C++",
    lang: "cpp",
    icon: Cpu,
    students: 156,
    level: "Advanced",
    color: "text-primary",
  },
  {
    title: "Web Dev Bootcamp",
    lang: "html/css/js",
    icon: Globe,
    students: 312,
    level: "Beginner",
    color: "text-accent",
  },
  {
    title: "SQL & Databases",
    lang: "sql",
    icon: Database,
    students: 98,
    level: "Intermediate",
    color: "text-primary",
  },
  {
    title: "Algorithms Lab",
    lang: "multi",
    icon: BookOpen,
    students: 201,
    level: "Advanced",
    color: "text-accent",
  },
];

const ClassroomsSection = () => {
  return (
    <section id="classrooms" className="py-24">
      <div className="container mx-auto px-6">
        <div className="mb-12">
          <p className="font-mono text-sm text-primary mb-2">// classrooms</p>
          <h2 className="text-3xl md:text-4xl font-bold font-mono text-foreground">
            Future <span className="text-primary">Features Mga bows</span>
          </h2>
         
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classrooms.map((room) => (
            <div
              key={room.title}
              className="group bg-card border border-border rounded-lg p-5 hover:border-glow transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <room.icon className={`h-8 w-8 ${room.color}`} />
                <span className="font-mono text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">
                  {room.level}
                </span>
              </div>
              <h3 className="font-mono font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                {room.title}
              </h3>
              <p className="font-mono text-xs text-muted-foreground mb-4">lang: {room.lang}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" /> {room.students} enrolled
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Live
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClassroomsSection;
