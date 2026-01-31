import React, { FC, useEffect, useState, useRef } from "react";
import { createApi } from "unsplash-js";
import { useNavigate, useLocation } from "react-router-dom";
import "../Styles/MainStyle.css";
import Tabs from "../Components/TabsHeader";

const formatNumber = (num: number): string => new Intl.NumberFormat('en-US').format(num);

interface Photo {
  id: string;
  likes: number;
  width: number;
  height: number;
  urls: { regular: string; full?: string };
  color: string | null;
  user: { username: string; name: string };
  views?: number;
  downloads?: number;
}

interface PhotosResponse {
  results: Photo[];
}

const api = createApi({ accessKey: process.env.REACT_APP_UNSPLASH_ACCESS_KEY || "" });

const PhotoComp: React.FC<{ photo: Photo; onView?: (p: Photo) => void }> = ({ photo, onView }) => {
  const { user, urls, likes, views, downloads } = photo;

  const handleClick = () => onView?.(photo);

  return (
    <div
      className="imgPostContainer"
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      role="button"
      tabIndex={0}
      aria-label={`View photo by ${user.name}`}
    >
      <img className="img" src={urls.regular} alt={"Photo by " + user.name} />
      <div className="viewIndicator" aria-hidden="true">
        <span className="viewIndicatorIcon" />
        <span>View</span>
      </div>
      <div className="photoDetails">
        <a
          className="credit"
          target="_blank"
          rel="noopener noreferrer"
          href={`https://unsplash.com/@${user.username}`}
          onClick={(e) => e.stopPropagation()}
        >
          Photo by {user.name}
        </a>
        <div className="photo-stats-bar">
          <div className="stat-item">
            <span className="stat-label">Likes</span>
            <span className="stat-value">{formatNumber(likes)}</span>
          </div>
          {views !== undefined && (
            <div className="stat-item">
              <span className="stat-label">Views</span>
              <span className="stat-value">{formatNumber(views)}</span>
            </div>
          )}
          {downloads !== undefined && (
            <div className="stat-item">
              <span className="stat-label">Downloads</span>
              <span className="stat-value">{formatNumber(downloads)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Lightbox: React.FC<{
  photo: Photo | null;
  onClose: () => void;
}> = ({ photo, onClose }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const startLoadTime = useRef<number>(0);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    if (photo) {
      setIsLoaded(false);
      startLoadTime.current = Date.now();
    }
  }, [photo]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!photo) return null;

  const imageUrl = photo.urls.full ?? photo.urls.regular;
  const { user } = photo;

  const handleImageLoad = () => {
    const elapsed = Date.now() - startLoadTime.current;
    // If it loaded super fast (cached), show immediately suitable, otherwise ensure a minimal delay for smoothness if desired,
    // but for "cool" factor, showing immediately upon load is usually best unless we want to force the animation.
    // We'll let the CSS transition handle the smoothness.
    setIsLoaded(true);
  };

  return (
    <div
      className="lightbox-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="View full size image"
    >
      <button type="button" className="lightbox-close" onClick={onClose} aria-label="Close" />
      <div className="lightbox-content">
        <div className="lightbox-img-wrapper">
          {!isLoaded && <div className="image-loader" />}

          {(photo.likes !== undefined || photo.views !== undefined || photo.downloads !== undefined) && (
            <div className="lightbox-stats">
              <div className="stat-item">
                <span className="stat-label">Likes</span>
                <span className="stat-value">{formatNumber(photo.likes)}</span>
              </div>
              {photo.views !== undefined && (
                <div className="stat-item">
                  <span className="stat-label">Views</span>
                  <span className="stat-value">{formatNumber(photo.views)}</span>
                </div>
              )}
              {photo.downloads !== undefined && (
                <div className="stat-item">
                  <span className="stat-label">Downloads</span>
                  <span className="stat-value">{formatNumber(photo.downloads)}</span>
                </div>
              )}
            </div>
          )}

          <img
            src={imageUrl}
            alt={"Photo by " + user.name}
            className={`lightbox-img ${isLoaded ? "loaded" : ""}`}
            onLoad={handleImageLoad}
          />
        </div>
        <a
          className="lightbox-credit"
          target="_blank"
          rel="noopener noreferrer"
          href={`https://unsplash.com/@${user.username}`}
          onClick={(e) => e.stopPropagation()}
          style={{ opacity: isLoaded ? 1 : 0, transition: "opacity 0.5s 0.2s" }}
        >
          Photo by {user.name}
        </a>
      </div>
    </div>
  );
};

const Top: FC<{ onPhotoView?: (p: Photo) => void }> = ({ onPhotoView }) => {
  const [topPhotos, setTopPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiLimited, setApiLimited] = useState(false);

  useEffect(() => {
    const fetchPopularPhotos = async () => {
      setIsLoading(true);
      try {
        const result = await api.photos.list({ page: 1, perPage: 20 });

        if (result.response) {
          setTopPhotos(result.response.results);
        }
      } catch (error) {
        console.error("Error fetching popular photos:", error);
        setApiLimited(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularPhotos();
  }, []);

  return (
    <div className="top-section">
      <h1>Top 20 Images</h1>
      {isLoading && (
        <div className="loading-dots" aria-label="Loading">
          <span /><span /><span />
        </div>
      )}
      {apiLimited && <div className="api-message">API limit reached. No popular images available.</div>}
      <ul className="topPhotosGrid">
        {topPhotos.map((photo, index) => (
          <li
            key={photo.id}
            className="topPhotoItem"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <PhotoComp photo={photo} onView={onPhotoView} />
          </li>
        ))}
      </ul>
    </div>
  );
};

const Main: FC<{ onPhotoView?: (p: Photo) => void }> = ({ onPhotoView }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryFromURL = new URLSearchParams(location.search).get("query");

  const [data, setPhotosResponse] = useState<PhotosResponse>({ results: [] });
  const [query, setQuery] = useState<string>(queryFromURL || "moody");
  const [searchInput, setSearchInput] = useState<string>(queryFromURL || "");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [apiLimited, setApiLimited] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastPhotoRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    setPage(1);
    setApiLimited(false);
    setPhotosResponse({ results: [] });
    fetchPhotos(query, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (apiLimited || isLoading) return;

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prev) => prev + 1);
      }
    });

    if (lastPhotoRef.current) {
      observerRef.current.observe(lastPhotoRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [isLoading, apiLimited]);

  const fetchPhotos = async (searchQuery: string, pageNumber: number) => {
    if (apiLimited) return;
    setIsLoading(true);

    try {
      const result = await api.search.getPhotos({ query: searchQuery, orientation: "landscape", page: pageNumber });

      if (result.errors) {
        setApiLimited(true);
        setPhotosResponse((prev) => ({
          results: [
            ...prev.results,
            {
              id: "placeholder-403",
              likes: 0,
              width: 600,
              height: 400,
              urls: { regular: `https://placehold.co/800/251e1e/white?text=Error+403+Unsplash+API+Limited&font=Playfair Display` },
              color: null,
              user: { username: "placeholder_user", name: "Placeholder User" },
              views: 0,
              downloads: 0,
            },
          ],
        }));
        return;
      }

      if (result.response) {
        const photosWithStats = await Promise.all(
          result.response.results.map(async (photo) => {
            const stats = await api.photos.getStats({ photoId: photo.id });
            if (stats.type === "success") {
              return { ...photo, views: stats.response.views.total, downloads: stats.response.downloads.total };
            }
            return photo;
          })
        );

        setPhotosResponse((prev) => ({
          results: [...prev.results, ...photosWithStats],
        }));
        saveToHistory(searchQuery);
      }
    } catch (err) {
      console.error("API request failed:", err);
      setApiLimited(true);
      setPhotosResponse((prev) => ({
        results: [
          ...prev.results,
          {
            id: "placeholder-403",
            likes: 0,
            width: 600,
            height: 400,
            urls: { regular: `https://placehold.co/800/251e1e/white?text=Error+403+Unsplash+API+Limited&font=Playfair Display` },
            color: null,
            user: { username: "placeholder_user", name: "Placeholder User" },
            views: 0,
            downloads: 0,
          },
        ],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const saveToHistory = (searchTerm: string) => {
    const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    if (!history.includes(searchTerm)) {
      const updatedHistory = [searchTerm, ...history].slice(0, 5);
      localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
    }
  };

  useEffect(() => {
    if (page > 1) {
      fetchPhotos(query, page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchInput.trim()) {
      navigate(`/?query=${searchInput.trim()}`);
      setQuery(searchInput.trim());
    }
  };

  return (
    <div className="feed">
      <input
        type="text"
        placeholder="Search photos..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyPress={handleSearch}
        className="search-input"
        aria-label="Search Unsplash photos"
      />
      <ul className="columnUl">
        {data.results.map((photo, index) => (
          <li
            key={photo.id}
            className="li"
            ref={index === data.results.length - 1 ? lastPhotoRef : null}
            style={{ animationDelay: `${Math.min(index * 0.04, 0.8)}s` }}
          >
            <PhotoComp photo={photo} onView={onPhotoView} />
          </li>
        ))}
      </ul>
      {isLoading && (
        <div className="loading-dots" aria-label="Loading more">
          <span /><span /><span />
        </div>
      )}
      {apiLimited && <div className="api-message">API limit reached. No more images can be loaded.</div>}
    </div>
  );
};

const Home: FC = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  return (
    <main className="root">
      <Lightbox photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      <Tabs />
      <Top onPhotoView={setSelectedPhoto} />
      <Main onPhotoView={setSelectedPhoto} />
    </main>
  );
};

export default Home;
