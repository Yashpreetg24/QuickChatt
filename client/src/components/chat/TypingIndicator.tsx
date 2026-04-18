export function TypingIndicator() {
  return (
    <div className="bubble-received inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-md">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground/80 animate-bounce-dot"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
