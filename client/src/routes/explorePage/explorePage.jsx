import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import apiRequest from '../../utils/apiRequest';
import Image from '../../components/image/image';
import Skeleton from '../../components/skeleton/skeleton';
import useAuthStore from '../../utils/authStore';
import VisualSearch from '../../components/visualSearch/VisualSearch';
import './ExplorePage.css';

const ExplorePage = () => {
    const { currentUser } = useAuthStore();

    // Query 1: Fetch tags (user-related tags if logged in, otherwise popular tags)
    const { data: interestTags, isLoading: tagsLoading } = useQuery({
        queryKey: currentUser ? ['relatedTags', currentUser._id] : ['popularTags'],
        queryFn: () => {
            const url = currentUser ? '/pins/related-tags' : '/pins/tags/popular';
            return apiRequest.get(url).then(res => res.data);
        },
    });

    // Query 2: Fetch trending pins (ranked by likes and comments)
    const { data: trendingData, isLoading: trendingLoading } = useQuery({
        queryKey: ['trendingPins'],
        queryFn: () => apiRequest.get('/pins/trending').then(res => res.data),
    });

    return (
        <div className="explorePage">
            {/* Visual Search Hero Component */}
            <VisualSearch />

            {/* Related Interests / Popular Topics */}
            <div className="relatedInterests">
                <h3>{currentUser ? "Related Interests" : "Popular Topics"}</h3>
                <div className="tagList">
                    {tagsLoading ? (
                        <p className="loading-text">Loading tags...</p>
                    ) : (
                        interestTags?.map((tag, index) => (
                            <Link to={`/?search=${tag}`} key={index} className="tagItem">
                                #{tag}
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* Instagram-Style Trending Showcase */}
            <div className="trendingPins">
                <div className="trending-header-bar">
                    <div>
                        <h3>🔥 Trending Pins</h3>
                        <p className="trending-subtitle">
                            Most loved & active posts right now with the highest likes and comments
                        </p>
                    </div>
                </div>

                {trendingLoading ? (
                    <Skeleton />
                ) : !trendingData?.pins || trendingData.pins.length === 0 ? (
                    <p className="no-trending-text">No trending pins available at the moment.</p>
                ) : (
                    <div className="trending-insta-grid">
                        {trendingData.pins.map((pin, index) => {
                            const creator = pin.user || {};
                            const creatorAvatar =
                                creator.img ||
                                "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";
                            const creatorName = creator.displayName || creator.username || "Creator";

                            return (
                                <article key={pin._id} className="insta-trending-card">
                                    {/* 1. Card Header: Owner Info & Rank Badge */}
                                    <div className="insta-card-header">
                                        <Link
                                            to={`/profile/${creator.username}`}
                                            className="insta-user-link"
                                            title={`View ${creatorName}'s profile`}
                                        >
                                            <img
                                                src={creatorAvatar}
                                                alt={creatorName}
                                                className="insta-avatar"
                                            />
                                            <div className="insta-user-details">
                                                <span className="insta-user-name">{creatorName}</span>
                                                <span className="insta-user-handle">@{creator.username}</span>
                                            </div>
                                        </Link>
                                        <div className="insta-rank-badge" title="Trending Rank">
                                            #{index + 1}
                                        </div>
                                    </div>

                                    {/* 2. Media Image */}
                                    <div className="insta-image-container">
                                        <Link to={`/pin/${pin._id}`} className="insta-media-link">
                                            <Image
                                                path={pin.media}
                                                alt={pin.title || "Trending Pin"}
                                                className="insta-media-img"
                                            />
                                            <div className="insta-media-hover-overlay">
                                                <span className="insta-overlay-cta">View Full Pin ➔</span>
                                            </div>
                                        </Link>
                                    </div>

                                    {/* 3. Instagram Action Bar (Likes, Comments, View) */}
                                    <div className="insta-action-bar">
                                        <div className="insta-metrics">
                                            <span className="insta-metric-item" title="Total Likes">
                                                <span className="metric-icon">❤️</span>
                                                <strong className="metric-number">{pin.likeCount ?? 0}</strong> likes
                                            </span>
                                            <span className="insta-metric-item" title="Total Comments">
                                                <span className="metric-icon">💬</span>
                                                <strong className="metric-number">{pin.commentCount ?? 0}</strong> comments
                                            </span>
                                        </div>
                                        <Link to={`/pin/${pin._id}`} className="insta-view-pin-btn">
                                            📌 View Pin
                                        </Link>
                                    </div>

                                    {/* 4. Details, Title & Description */}
                                    <div className="insta-card-body">
                                        <h4 className="insta-pin-title">
                                            <Link to={`/pin/${pin._id}`}>{pin.title}</Link>
                                        </h4>
                                        {pin.description && (
                                            <p className="insta-pin-desc">
                                                <strong className="desc-author">{creator.username}</strong>{" "}
                                                {pin.description}
                                            </p>
                                        )}

                                        {/* Tags */}
                                        {pin.tags && pin.tags.length > 0 && (
                                            <div className="insta-tags-row">
                                                {pin.tags.map((tag, tIdx) => (
                                                    <Link
                                                        to={`/?search=${tag}`}
                                                        key={tIdx}
                                                        className="insta-tag-pill"
                                                    >
                                                        #{tag}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExplorePage;