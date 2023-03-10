import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import classNames from 'classnames/bind';
import { motion } from 'framer-motion';
import { useContext, useEffect, useRef, useState } from 'react';
import Youtube from 'react-youtube';
import { ModalContext } from '~/context/ModalContext';
import * as httpRequest from '~/utils/httpRequest';
import styles from './MoviePoster.module.scss';

const cx = classNames.bind(styles);

function MoviePoster({ baseUrl, movie, genres, movieId, type, setShowModal, index }) {
    const API_KEY = process.env.REACT_APP_API_KEY;
    const [isHover, setIsHover] = useState(false)
    const [delayHandler, setDelayHandler] = useState()
    const [movieDetails, setMovieDetails] = useState([])
    const [trailerUrl, setTrailerUrl] = useState()

    //get modal movie id
    const bannerMId = useContext(ModalContext)

    //get type for modal
    useEffect(() => {
        bannerMId.setType(type)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type])

    //handle modal
    function handleModalOpen(id) {
        setShowModal(true)
        bannerMId.setBannerM(id)
    }

    //movie details
    useEffect(() => {
        async function fetchData() {
            const movieDetail = `/movie/${movieId}?api_key=${API_KEY}&language=en-US&append_to_response=videos`
            const tvDetail = `/tv/${movieId}?api_key=${API_KEY}&language=en-US&append_to_response=videos`
            let fetchDateType = ``
            type === "movies" ? fetchDateType = movieDetail : fetchDateType = tvDetail

            var request = await httpRequest.get(fetchDateType)
            let trailerIndex = request.videos.results.findIndex(v => v.type === "Trailer")
            setTrailerUrl(request.videos.results[trailerIndex])
            setMovieDetails(request)

            //set movieID for modal from banner
            // bannerMId.setBannerM(movieId)
            return request;
        }
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [movieId])

    // console.log(movieDetails)

    function countSeason(n) {
        if (n > 1) {
            return `${n} seasons`
        } else {
            return "1 season"
        }
    }

    function countRuntime(n) {
        return `${Math.floor(n / 60)}h ${n % 60}m`
    }

    //hover
    const handleMouseEnter = () => {
        setDelayHandler(setTimeout(() => {
            setIsHover(true)
        }, 800))
    }

    const handleMouseLeave = () => {
        clearTimeout(delayHandler)
        setIsHover(false)
    }

    function truncate(str, n) {
        return str?.length > n ? str.substr(0, n - 1) + " ..." : str;
    }

    //genres
    let objectGenres = useRef([{}])

    useEffect(() => {
        if (movie.genre_ids != null) {
            objectGenres.current = genres.filter(genre => movie.genre_ids.includes(genre.id)).slice(0, 4)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [genres])

    //trailer
    const opts = {
        height: "180",
        width: "100%",
        playerVars: {
            // https://developers.google.com/youtube/player_parameters
            autoplay: 1,
            controls: 0,
            mute: 1,
            modestbranding: 1
        }
    };

    const checkReady = (e) => {
        var res = e.target.playerInfo.playerState
        if (res === -1) {
            setTrailerUrl("")
        }
    }

    const checkElapsedTime = (e) => {
        const duration = e.target.getDuration();
        const currentTime = e.target.getCurrentTime();
        if (currentTime / duration > 0.8) {
            setTrailerUrl("")
        }
    }

    function handleScale(index) {
        switch (index) {
            case 1:
                return -90
            case 2:
                return -70
            case 3:
                return -65
            case 4:
                return -70
            case 5:
                return -90
            case 6:
                return -160
            default:
                return 0
        }
    }

    return (
        <div className={cx('movieposter-wrapper')}>

            <motion.div className={cx('movie-posters')}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onMouseEnter={() => handleMouseEnter()}
                onMouseLeave={() => handleMouseLeave()}
                style={{ left: isHover && handleScale(index) }}
            >
                <div className={cx(isHover ? 'movie-backdrop' : 'movie-img')}
                    style={{ backgroundImage: `url(${baseUrl}${isHover ? movie.backdrop_path : movie.poster_path})` }}
                >

                    {isHover && <div className={cx('movie-trailer-cover')}></div>}
                    {(trailerUrl && isHover) && (<Youtube
                        videoId={`${trailerUrl.key}`}
                        containerClassName={cx('embed', 'embed-youtube')}
                        onStateChange={(e) => checkElapsedTime(e)}
                        onReady={(e) => checkReady(e)}
                        opts={opts}
                    />
                    )}

                    {isHover && (<motion.div className={cx('poster-info')}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className={cx('poster-title')}>
                            {truncate(movie.title || movie.name || movie.original_name, 25)}
                        </div>
                        <div className={cx('poster-icons')}>
                            <div>
                                <PlayArrowIcon className={cx('poster-icon-play')} />
                                <AddOutlinedIcon className={cx('poster-icon-add')} />
                                <ThumbUpOutlinedIcon className={cx('poster-icon-like')} />
                                <ThumbDownAltOutlinedIcon className={cx('poster-icon-like')} />
                            </div>

                            <div><KeyboardArrowDownOutlinedIcon className={cx('poster-icon-arrow')} onClick={() => handleModalOpen(movieId)} /></div>
                        </div>
                        <div className={cx('poster-info-top')}>
                            <span className={cx('poster-vote')}>{movie.vote_average} Rate</span>
                            <span className={cx('poster-season')}>{type === "tvShows" ?
                                (countSeason(movieDetails.number_of_seasons))
                                : (countRuntime(movieDetails.runtime))}</span>
                        </div>

                        <div className={cx('poster-genres')}>
                            <ul>
                                {(objectGenres.current).map(genre => (
                                    <li key={genre.id}>{genre.name}</li>
                                ))}

                            </ul>
                        </div>
                    </motion.div>)}
                </div>

            </motion.div>

        </div>
    )
}

export default MoviePoster