function TrendingTopics({ topics }) {
  const fixedTopics = [
    'FICT',
    'FHS',
    'FMB',
  ];

  return (
    <aside className="trending-topics">
      <h2>Trending Topics</h2>

      {/* TOPIC FAKULTAS WAJIB */}
      <div className="topic-list fixed-topics">
        {fixedTopics.map((topic) => (
          <span
            key={topic}
            className="topic-tag fixed-topic"
          >
            #{topic}
          </span>
        ))}
      </div>

      {/* TOPIC DINAMIS / TRENDING */}
      {topics.length > 0 && (
        <div className="topic-list dynamic-topics">
          {topics
            .filter(
              (topic) =>
                !fixedTopics.includes(
                  topic.name.toUpperCase()
                )
            )
            .map((topic) => (
              <span
                key={`${topic.type}-${topic.name}`}
                className="topic-tag"
              >
                #{topic.name}
              </span>
            ))}
        </div>
      )}
    </aside>
  );
}

export default TrendingTopics;