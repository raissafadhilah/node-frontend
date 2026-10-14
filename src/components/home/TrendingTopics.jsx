
import { Link } from 'react-router-dom';

function TrendingTopics({
  topics = [],
  selectedTopic = '',
}) {
  const fixedTopics = ['FICT', 'FHS', 'FMB'];

  // Gabungkan tag fakultas dan tag dinamis dalam satu daftar.
  // Tag yang sama tidak ditampilkan dua kali.
  const allTopics = [
    ...fixedTopics,
    ...topics.map((topic) =>
      String(topic.name).replace(/^#/, '').trim()
    ),
  ].filter(Boolean).filter(
    (topic, index, list) =>
      list.findIndex(
        (item) => item.toLowerCase() === topic.toLowerCase()
      ) === index
  );

  const normalizedSelectedTopic = selectedTopic
    .replace(/^#/, '')
    .trim()
    .toLowerCase();

  return (
    <aside className="trending-topics">
      <div className="trending-topics-heading">
        <h2>Trending Topics</h2>

        {selectedTopic && (
          <Link to="/" className="clear-topic-button">
            Reset
          </Link>
        )}
      </div>

      <div className="topic-list">
        {allTopics.map((topic) => {
          const normalizedName = topic.trim();
          const isActive =
            normalizedSelectedTopic ===
            normalizedName.toLowerCase();

          return (
            <Link
              key={normalizedName.toLowerCase()}
              to={`/tag/${encodeURIComponent(normalizedName)}`}
              className={`topic-tag ${
                isActive ? 'topic-tag-active' : ''
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              #{normalizedName}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

export default TrendingTopics;

// fixed-topics dan dynamic-topics tidak lagi menjadi dua container terpisah.
// Tag fakultas tetap muncul, lalu tag lain menyusul dalam daftar yang sama.
// Tag yang sama tidak ditampilkan dua kali.
// Semua tag tetap menggunakan class .topic-tag dan tetap dapat diklik.