function TrendingTopics({
  topics = [],
  selectedTopic = '',
  onTopicClick = () => {},
}) {
  const fixedTopics = ['FICT', 'FHS', 'FMB'];

  const dynamicTopics = topics.filter(
    (topic) =>
      !fixedTopics.includes(
        String(topic.name).replace(/^#/, '').toUpperCase()
      )
  );

  const renderTopic = (name, fixed = false) => {
    const normalizedName = String(name).replace(/^#/, '');
    const isActive =
      selectedTopic.toLowerCase() === normalizedName.toLowerCase();

    return (
      <button
        key={normalizedName}
        type="button"
        className={`topic-tag ${fixed ? 'fixed-topic' : ''} ${
          isActive ? 'topic-tag-active' : ''
        }`}
        aria-pressed={isActive}
        onClick={() => onTopicClick(isActive ? '' : normalizedName)}
      >
        #{normalizedName}
      </button>
    );
  };

  return (
    <aside className="trending-topics">
      <div className="trending-topics-heading">
        <h2>Trending Topics</h2>

        {selectedTopic && (
          <button
            type="button"
            className="clear-topic-button"
            onClick={() => onTopicClick('')}
          >
            Reset
          </button>
        )}
      </div>

      <div className="topic-list fixed-topics">
        {fixedTopics.map((topic) => renderTopic(topic, true))}
      </div>

      {dynamicTopics.length > 0 && (
        <div className="topic-list dynamic-topics">
          {dynamicTopics.map((topic) => renderTopic(topic.name))}
        </div>
      )}
    </aside>
  );
}

export default TrendingTopics;