import axios from "axios"
import qs from "qs";

class SpotifyClient {
    static async initialize() {
        const response = await axios.post(
            "https://accounts.spotify.com/api/token",
            qs.stringify({
                grant_type: "client_credentials",
                client_id: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
                client_secret: process.env.REACT_APP_SPOTIFY_CLIENT_SECRET,
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        let spotify = new SpotifyClient();
        spotify.token = response.data.access_token;
        spotify.tokenExpiry = Date.now() + response.data.expires_in * 1000; // 有効期限を記録
        return spotify;
    }

    async ensureValidToken() {
        if (Date.now() >= this.tokenExpiry) {
            const newClient = await SpotifyClient.initialize();
            this.token = newClient.token;
            this.tokenExpiry = newClient.tokenExpiry;
        }
    }

    async getPopularSongs() {
        await this.ensureValidToken();
        const playlistId = "5SLPaOxQyJ8Ne9zpmTOvSe";
        const response = await axios.get(
            `https://api.spotify.com/v1/playlists/${playlistId}`,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                },
            }
        );
        return response.data.tracks;
    }

    async searchSongs(keyword,limit,offset) {
        await this.ensureValidToken();
        const response = await axios.get("https://api.spotify.com/v1/search", {
            headers: {
                Authorization: `Bearer ${this.token}`,
            },
            params: { q: keyword, type: "track",limit,offset },
        });
        return response.data.tracks;
    }
}

const spotify = await SpotifyClient.initialize();
export default spotify;