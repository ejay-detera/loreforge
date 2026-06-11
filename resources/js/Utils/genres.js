export const GENRES = {
    FANTASY: 'fantasy',
    HORROR: 'horror',
    SCIFI: 'scifi',
};

export const GENRE_LABELS = {
    [GENRES.FANTASY]: 'Fantasy',
    [GENRES.HORROR]: 'Horror',
    [GENRES.SCIFI]: 'Sci-fi',
};

export const getGenreLabel = (genre) => {
    return GENRE_LABELS[genre?.toLowerCase()] || 'Fantasy';
};
