import { useEffect, useState } from "react";
import { SongList } from "./components/SongList";
import spotify from "./lib/spotify";
import { SearchInput } from './components/SearchInput';
import { Pagination } from "./components/Pagination";


export default function App() {
  const [isLoading,setIsLoading] = useState(false);
  const [popularSongs,setPopularSongs] = useState([]);
  const [keyword,setKeyword] = useState("");
  const [searchedSongs, setSearchedSongs] = useState();
  const [page, setpage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const isSearchedResult = searchedSongs != null;
  const limit = 20;

  useEffect(() => {
    fetchPopularSongs();
  },[]);

  const fetchPopularSongs = async() => {
    setIsLoading(true);
    const result = await spotify.getPopularSongs();
    const popularSongs = result.items.map((item) => {
      return item.track;
    });
    setPopularSongs(popularSongs);
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    setKeyword(e.target.value);
  };

  const searchSongs = async(page) => {
    setIsLoading(true);
    const offset = parseInt(page) ? (parseInt(page) - 1) * limit : 0;
    const result = await spotify.searchSongs(keyword,limit,offset);
    setHasNext(result.next != null);
    setHasPrev(result.previous != null);
    console.log(result);
    setSearchedSongs(result.items);
    setIsLoading(false);
  }

  const moveToNext = async () => {
    const nextPage = page + 1;
    await searchSongs(nextPage);
    setpage(nextPage);
  }
  
  const moveToPrev = async () => {
    const prevPage = page - 1;
    await searchSongs(prevPage);
    setpage(prevPage);
  }
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <main className="flex-1 p-8 mb-20">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold">Music App</h1>
        </header>
        <SearchInput onInputChange={handleInputChange} onSubmit={searchSongs} />
        <section>
          <h2 className="text-2xl font-semibold mb-5">{isSearchedResult ? "Search Results" : "Popular Songs"}
            </h2>
          <SongList 
            isLoading={isLoading} 
            songs={isSearchedResult ? searchedSongs : popularSongs}
            />
            {isSearchedResult && (<Pagination 
            onPrev={hasPrev ? moveToPrev : null} 
            onNext={hasNext ? moveToNext : null}
            />)}
        </section>
      </main>
    </div>
  );
}
