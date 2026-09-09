"use client";

const stars = Array.from({ length: 54 }, (_, index) => ({
  left: `${(index * 47) % 101}%`,
  top: `${(index * 83) % 97}%`,
  size: 1 + (index % 3),
  delay: `${-(index % 11)}s`,
  duration: `${5 + (index % 7)}s`,
}));

export function SpaceBackdrop() {
  return (
    <div className="space-backdrop" aria-hidden="true">
      <div className="nebula nebula--one" />
      <div className="nebula nebula--two" />
      {stars.map((star, index) => (
        <i
          className="star"
          key={index}
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}
      <div className="planet-horizon" />
    </div>
  );
}
