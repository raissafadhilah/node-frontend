import { Link } from 'react-router-dom';

function TrendingDiscussions({
  discussions = [],
  selectedTopic = '',
  showAll = false,
}) {
  const normalizedSelectedTopic = selectedTopic
    .replace(/^#/, '')
    .trim()
    .toLowerCase();

  const filteredDiscussions = selectedTopic
    ? discussions.filter((post) => {
      const tags = [
        ...(post.hashtags || []),
        post.topic || '',
        post.topic_name || '',
      ].map((tag) =>
        String(tag).replace(/^#/, '').trim().toLowerCase()
      );

      return tags.includes(normalizedSelectedTopic);
    })
    : discussions;

  const visibleDiscussions = showAll
    ? filteredDiscussions
    : filteredDiscussions.slice(0, 3);

  return (
    <section
      className={`trending-discussions ${
        showAll ? 'trending-discussions-full' : ''
      }`}
    >
      {!showAll && (
        <div className="section-heading">
          <h2>Trending Discussions</h2>
          <Link
            to="/trending-discussions"
            className="see-more-button"
          >
            See more
          </Link>
        </div>
      )}

      {selectedTopic && (
        <div className="active-topic-filter">
          Menampilkan topik <strong>#{selectedTopic.replace(/^#/, '')}</strong>
        </div>
      )}

      <div
        className={`trending-discussion-list ${
          showAll ? 'trending-discussion-list-full' : ''
        }`}
      >
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
                className={`trending-discussion-card ${index < 3
                  ? 'discussion-card-horizontal'
                  : 'discussion-card-vertical'
                  }`}
              >
                <div className="discussion-user">

                  <div className="discussion-avatar" aria-hidden="true">
                    {post.profile_photo ? (
                      <img
                        src={
                          post.profile_photo.startsWith('http')
                            ? post.profile_photo
                            : `http://localhost/node/${post.profile_photo.replace(/^\/+/, '')}`
                        }
                        alt=""
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                          event.currentTarget.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}

                    <span
                      className="discussion-avatar-fallback"
                      style={{
                        display: post.profile_photo ? 'none' : 'flex',
                      }}
                    >
                      {initials}
                    </span>
                  </div>


                  <div>
                    <strong>{post.full_name || 'Pengguna'}</strong>
                    <span>{post.status || 'Anggota'}</span>
                  </div>
                </div>

                <p
                  className="discussion-content"
                  title={post.content || ''}
                >
                  {post.content}
                </p>

                {/* Jumlah balasan berada di atas tag */}
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

                {/* Tag kategori berada di bagian paling bawah */}
                {post.hashtags?.length > 0 && (
                  <div className="discussion-tags">
                    {post.hashtags.map((hashtag, tagIndex) => {
                      const normalizedTag = String(hashtag)
                        .replace(/^#/, '')
                        .trim();

                      return (
                        <Link
                          key={`${normalizedTag}-${tagIndex}`}
                          to={`/tag/${encodeURIComponent(normalizedTag)}`}
                          className="discussion-tag-link"
                        >
                          #{normalizedTag}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

export default TrendingDiscussions;
