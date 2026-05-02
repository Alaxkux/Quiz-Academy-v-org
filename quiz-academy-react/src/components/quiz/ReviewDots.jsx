export default function ReviewDots({ questionData = [], currentIndex, onSelect }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {questionData.map((q, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          title={`Q${i + 1} — ${q.isCorrect ? 'Correct' : q.userAnswer === null ? 'Skipped' : 'Wrong'}`}
          className="rounded-md transition-all"
          style={{
            width:      i === currentIndex ? 22 : 18,
            height:     i === currentIndex ? 22 : 18,
            background: i === currentIndex
              ? 'var(--accent)'
              : q.isCorrect
                ? 'var(--green)'
                : q.userAnswer === null
                  ? 'var(--border2)'
                  : 'var(--red)',
            transform:  i === currentIndex ? 'scale(1.1)' : 'scale(1)',
            border:     i === currentIndex ? '2px solid var(--accent)' : 'none',
          }}
        />
      ))}
    </div>
  )
}
