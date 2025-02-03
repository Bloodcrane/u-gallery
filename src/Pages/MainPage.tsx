import React, { FC, Fragment, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { createApi } from "unsplash-js";
import "../Styles/MainStyle.css";
import Tabs from "../Components/TabsHeader";

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

interface Photo {
  id: string;
  likes: number;
  width: number;
  height: number;
  urls: { regular: string };
  color: string | null;
  user: {
    username: string;
    name: string;
  };
  views?: number;
  downloads?: number;
}

interface PhotosResponse {
  results: Photo[];
}

const api = createApi({
  accessKey: "UsBTuhA6nSUTj8G15KlwifZNS7FzdAr_fIGK2dKs5x8",
});

const PhotoComp: React.FC<{ photo: Photo }> = ({ photo }) => {
  const { user, urls, likes, views, downloads } = photo;

  return (
    <Fragment>
      <div className="imgPostContainer">
        <img className="img" src={urls.regular} alt={"Photo by " + user.name} />
        <div className="photoDetails">
          <a
            className="credit"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://unsplash.com/@${user.username}`}
          >
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
    </Fragment>
  );
};

const Body: FC = () => {
  const [data, setPhotosResponse] = useState<PhotosResponse | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>("moody");
  const [searchInput, setSearchInput] = useState<string>("");

  const fetchPhotos = async (searchQuery: string) => {
    try {
      const result = await api.search.getPhotos({ query: searchQuery, orientation: "landscape" });
      if (result.errors) {
        setError(result.errors[0]);
      } else if (result.response) {
        const photosWithStats = await Promise.all(
          result.response.results.map(async (photo) => {
            const stats = await api.photos.getStats({ photoId: photo.id });
            if (stats.type === "success") {
              return {
                ...photo,
                views: stats.response.views.total,
                downloads: stats.response.downloads.total,
              };
            }
            return photo;
          })
        );
        setPhotosResponse({ results: photosWithStats });
      }
    } catch (err) {
      console.error("API request failed:", err);
      setError(null);
      setPhotosResponse({
        results: Array.from({ length: 10 }).map((_, index) => ({
          id: `placeholder-${index}`,
          likes: 0,
          width: 600,
          height: 400,
          urls: { regular: `https://placehold.co/800/251e1e/white?text=Error+403+Unsplash+API+Limited&font=Playfair Display` },
          color: null,
          user: {
            username: "placeholder_user",
            name: "Placeholder User",
          },
          views: 0,
          downloads: 0,
        })),
      });
    }
  };

  useEffect(() => {
    fetchPhotos(query);
  }, [query]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setQuery(searchInput);
    }
  };

  if (!data) {
    return <div>Loading...</div>;
  }

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
        {data.results.map((photo) => (
          <li key={photo.id} className="li">
            <PhotoComp photo={photo} />
          </li>
        ))}
      </ul>
    </div>
  );
};

const Home: FC = () => {
  return (
    <main className="root">
      <Tabs />
      <Body />
    </main>
  );
};

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<Home />);
} else {
  console.error("No root element found in HTML. Make sure to add <div id='root'></div> in your HTML file.");
}

export default Home;