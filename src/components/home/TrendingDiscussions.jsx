import { useState } from 'react';

function TrendingDiscussions({
  discussions = [],
  selectedTopic = '',
}) {
  const [showMore, setShowMore] = useState(false);

  const filteredDiscussions = selectedTopic
    ? discussions.filter((post) => {
        const tags = [
          ...(post.hashtags || []),
          post.topic || '',
          post.topic_name || '',
        ]
          .map((tag) =>
            String(tag).replace(/^#/, '').trim().toLowerCase()
          );

        return tags.includes(selectedTopic.replace(/^#/, '').trim().toLowerCase());
      })
    : discussions;

  const visibleDiscussions = showMore
    ? filteredDiscussions.slice(0, 6)
    : filteredDiscussions.slice(0, 3);

  return (
    <section className="trending-discussions">
      <div className="section-heading">
        <h2>Trending Discussions</h2>

        {filteredDiscussions.length > 3 && (
          <button
            type="button"
            className="see-more-button"
            onClick={() => setShowMore((previous) => !previous)}
          >
            {showMore ? 'See less' : 'See more'}
          </button>
        )}
      </div>

      {selectedTopic && (
        <div className="active-topic-filter">
          Menampilkan topik <strong>#{selectedTopic.replace(/^#/, '')}</strong>
        </div>
      )}

      <div className="trending-discussion-list">
        {visibleDiscussions.length === 0 ? (
          <div className="empty-state">
            {selectedTopic
              ? `Belum ada diskusi untuk topik #${selectedTopic.replace(/^#/, '')}.`
              : 'Belum ada trending discussion.'}
          </div>
        ) : (
          visibleDiscussions.map((post, index) => {
            const initials = post.full_name
              ? post.full_name
                  .split(' ')
                  .filter(Boolean)
                  .map((name) => name[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              : '?';

            return (
              <article
                key={post.id}
                className={`trending-discussion-card ${
                  index < 3
                    ? 'discussion-card-horizontal'
                    : 'discussion-card-vertical'
                }`}
              >
                <div className="discussion-user">
                  <div className="discussion-avatar" aria-hidden="true">
                    {initials}
                  </div>

                  <div>
                    <strong>{post.full_name || 'Pengguna'}</strong>
                    <span>{post.status || 'Anggota'}</span>
                  </div>
                </div>

                <p className="discussion-content">{post.content}</p>

                {post.hashtags?.length > 0 && (
                  <div className="discussion-tags">
                    {post.hashtags.map((hashtag, tagIndex) => (
                      <span key={`${hashtag}-${tagIndex}`}>
                        {String(hashtag).startsWith('#')
                          ? hashtag
                          : `#${hashtag}`}
                      </span>
                    ))}
                  </div>
                )}

                <div className="discussion-meta">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-5.5A7.5 7.5 0 1 1 20 11.5Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {post.comment_count ?? 0} balasan
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

export default TrendingDiscussions;