import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { store } from './store';
import AppShell from './layouts/AppShell';
import Home from './containers/Home';
import Search from './containers/Search';
import Library from './containers/Library';
import Playlist from './containers/Playlist';
import Artist from './containers/Artist';
import Settings from './containers/Settings';
import './styles/global.scss';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<Home />} />
            <Route path="search" element={<Search />} />
            <Route path="library" element={<Library />} />
            <Route path="liked" element={<Playlist />} />
            <Route path="playlist/:id" element={<Playlist />} />
            <Route path="artist" element={<Artist />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
