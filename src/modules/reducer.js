import axios from 'axios';

export const ADD_TO_FAVOURITE = 'ADD_TO_FAVOURITE';
export const REMOVE_FAVOURITE = 'REMOVE_FAVOURITE';
export const URL = 'https://itunes.apple.com/search';
export const SEARCH = 'SEARCH';
export const SEARCH_LOADING = 'SEARCH_LOADING';
export const CREATE_PLAYLIST = 'CREATE_PLAYLIST';
export const DELETE_PLAYLIST = 'DELETE_PLAYLIST';
export const ADD_TO_PLAYLIST = 'ADD_TO_PLAYLIST';
export const REMOVE_FROM_PLAYLIST = 'REMOVE_FROM_PLAYLIST';

let ifLocalStorage = localStorage.getItem("Favourite") ? JSON.parse(localStorage.getItem("Favourite")) : [];
let ifPlaylistsStorage = localStorage.getItem("Playlists") ? JSON.parse(localStorage.getItem("Playlists")) : [];

const initialState = {
    data: [],
    favourite: ifLocalStorage,
    playlists: ifPlaylistsStorage,
    value: '',
    loading: false
};

export default (state = initialState, action) => {
    switch (action.type) {
        case SEARCH_LOADING:
            return {
                ...state,
                loading: true
            };
        case SEARCH:
            return {
                ...state,
                data: action.payload,
                loading: false
            };

        case ADD_TO_FAVOURITE:
            const newFavourites = [...state.favourite, action.payload];
            localStorage.setItem('Favourite', JSON.stringify(newFavourites));
            // Dispatch custom event to notify components
            window.dispatchEvent(new Event('favoritesChanged'));
            return {
                ...state,
                favourite: newFavourites
            };

        case REMOVE_FAVOURITE:
            const updatedFavourites = state.favourite.filter(item => action.payload !== item);
            localStorage.setItem('Favourite', JSON.stringify(updatedFavourites));
            // Dispatch custom event to notify components
            window.dispatchEvent(new Event('favoritesChanged'));
            return {
                ...state,
                favourite: updatedFavourites
            };

        case CREATE_PLAYLIST:
            const newPlaylists = [...state.playlists, action.payload];
            localStorage.setItem('Playlists', JSON.stringify(newPlaylists));
            // Dispatch custom event to notify components
            window.dispatchEvent(new Event('playlistsChanged'));
            return {
                ...state,
                playlists: newPlaylists
            };

        case DELETE_PLAYLIST:
            const filteredPlaylists = state.playlists.filter(p => p.id !== action.payload);
            localStorage.setItem('Playlists', JSON.stringify(filteredPlaylists));
            return {
                ...state,
                playlists: filteredPlaylists
            };

        case ADD_TO_PLAYLIST:
            const updatedPlaylists = state.playlists.map(playlist => {
                if (playlist.id === action.payload.playlistId) {
                    // Check if song already exists
                    const songExists = playlist.songs.some(song => song.trackId === action.payload.song.trackId);
                    if (!songExists) {
                        return {
                            ...playlist,
                            songs: [...playlist.songs, action.payload.song]
                        };
                    }
                }
                return playlist;
            });
            localStorage.setItem('Playlists', JSON.stringify(updatedPlaylists));
            return {
                ...state,
                playlists: updatedPlaylists
            };

        case REMOVE_FROM_PLAYLIST:
            const playlistsAfterRemove = state.playlists.map(playlist => {
                if (playlist.id === action.payload.playlistId) {
                    return {
                        ...playlist,
                        songs: playlist.songs.filter(song => song.trackId !== action.payload.songId)
                    };
                }
                return playlist;
            });
            localStorage.setItem('Playlists', JSON.stringify(playlistsAfterRemove));
            return {
                ...state,
                playlists: playlistsAfterRemove
            };

        default:
            return state
    }
}


export const search = (item) => {
    return dispatch => {
        dispatch({ type: SEARCH_LOADING });
        return axios.get(URL + item)
            .then(res => {
                return dispatch({
                    type: SEARCH,
                    payload: res.data.results
                })
            })
            .catch(function (error) {
                console.log(error);
                dispatch({
                    type: SEARCH,
                    payload: []
                });
            });

    }
};


export const addToFavourite = (item) => {
    return dispatch => {
        return setTimeout(() => {
            dispatch({
                type: ADD_TO_FAVOURITE,
                payload: item,
            })
        }, 0)
    }
};

export const removeFavourite = (item) => {
    return dispatch => {
        return setTimeout(() => {
            let obj = JSON.parse(localStorage.getItem('Favourite'));
            let final = obj.filter((id) => {
                return id.trackId !== item.trackId;
            });

            localStorage.setItem('Favourite', JSON.stringify(final));
            // Dispatch custom event to notify components
            window.dispatchEvent(new Event('favoritesChanged'));

            dispatch({
                type: REMOVE_FAVOURITE,
                payload: item,

            })
        }, 0)
    }
};

export const createPlaylist = (name) => {
    return dispatch => {
        const newPlaylist = {
            id: `playlist-${Date.now()}`,
            name: name,
            songs: [],
            createdAt: new Date().toISOString()
        };
        dispatch({
            type: CREATE_PLAYLIST,
            payload: newPlaylist
        });
        // Dispatch custom event to notify components
        window.dispatchEvent(new Event('playlistsChanged'));
    }
};

export const deletePlaylist = (playlistId) => {
    return dispatch => {
        dispatch({
            type: DELETE_PLAYLIST,
            payload: playlistId
        });
    }
};

export const addToPlaylist = (playlistId, song) => {
    return dispatch => {
        dispatch({
            type: ADD_TO_PLAYLIST,
            payload: { playlistId, song }
        });
    }
};

export const removeFromPlaylist = (playlistId, songId) => {
    return dispatch => {
        dispatch({
            type: REMOVE_FROM_PLAYLIST,
            payload: { playlistId, songId }
        });
    }
};
