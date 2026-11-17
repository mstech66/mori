import Nav from "@/components/nav/Nav";
import NotesList from "@/components/noteslist/NotesList";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Nav />
      <NotesList />
    </main>
  );
}
