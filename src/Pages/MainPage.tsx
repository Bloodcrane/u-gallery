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
  urls: { regular: string };
  color: string | null;
  user: { username: string; name: string };
  views?: number;
  downloads?: number;
}

interface PhotosResponse {
  results: Photo[];
}

const api = createApi({ accessKey: "_TfSGps8TbKyFhdW-5VrcF2KGBCPxl2k7xZCqlQRfpQ" });

const PhotoComp: React.FC<{ photo: Photo }> = ({ photo }) => {
  const { user, urls, likes, views, downloads } = photo;

  return (
    <div className="imgPostContainer">
      <img className="img" src={urls.regular} alt={"Photo by " + user.name} />
      <div className="photoDetails">
        <a className="credit" target="_blank" rel="noopener noreferrer" href={`https://unsplash.com/@${user.username}`}>
          {"Photo by " + user.name}
        </a>
        <div className="photo-details">
          <div className="stats">
            <span> ❤️ {formatNumber(likes)}</span>
            {views !== undefined && <span> 👁️ {formatNumber(views)}</span>}
            {downloads !== undefined && <span> ⬇️ {formatNumber(downloads)}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

const Top: FC = () => {
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
    <div>
      <h1>Top 20 Images</h1>
      {isLoading && <div>Loading popular images...</div>}
      {apiLimited && <div>API limit reached. No popular images available.</div>}
      <ul className="topPhotosGrid">
        {topPhotos.map((photo) => (
          <li key={photo.id} className="topPhotoItem">
            <PhotoComp photo={photo} />
          </li>
        ))}
      </ul>
    </div>
  );
};

const Main: FC = () => {
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
        placeholder="🔍 Search photos..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyPress={handleSearch}
        className="search-input"
      />
      <ul className="columnUl">
        {data.results.map((photo, index) => (
          <li key={photo.id} className="li" ref={index === data.results.length - 1 ? lastPhotoRef : null}>
            <PhotoComp photo={photo} />
          </li>
        ))}
      </ul>
      {isLoading && <div>Loading more images...</div>}
      {apiLimited && <div>API limit reached. No more images can be loaded.</div>}
    </div>
  );
};

const Home: FC = () => {
  return (
    <main className="root">
      <Tabs />
      <Top />
      <Main />
    </main>
  );
};

export default Home;
