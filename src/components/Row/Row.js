/* eslint-disable no-unused-vars */
import React, { useState, useEffect, memo, useRef, useContext } from 'react';
import classNames from 'classnames/bind';
import styles from './Row.module.scss';
import * as httpRequest from '~/utils/httpRequest';
import MoviePoster from '../MoviePoster/MoviePoster'
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import { Skeleton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { GenreContext } from '~/context/GenreContext';


const baseUrl = process.env.REACT_APP_BASE_URL_LARGE;
const cx = classNames.bind(styles);

function Row({ title, fetchUrl, fetchGenres, type, setShowModal }) {
    const [movies, setMovies] = useState({
        loading: true,
        data: [],
    });

    const [indexStart, setIndexStart] = useState(0)
    const [indexEnd, setIndexEnd] = useState(8)

    const [isMovedLeft, setIsMovedLeft] = useState(false)
    const [IsMovedRight, setIsMovedRight] = useState(false)
    const [slideNum, setSlideNum] = useState(0)
    const [genre, setGenres] = useState([])


    //handle filter genre--> take data from banner
    const genreIds = useContext(GenreContext)


    //load movies when Row render
    // 0,8   7, 15    14, 20
    useEffect(() => {
        async function fetchData() {

            //handle filter genre--> take data from banner
            var url
            if (type === "movies" || type === undefined) {
                if (fetchUrl.includes("%2C")) {
                    url = fetchUrl.replace(`%2C${genreIds.selectedMovieGenre}`, "")
                } else {
                    url = fetchUrl.concat(`%2C${genreIds.selectedMovieGenre}`)
                }
            } else {
                if (fetchUrl.includes("%2C")) {
                    url = fetchUrl.replace(`%2C${genreIds.selectedGenre}`, "")
                } else {
                    url = fetchUrl.concat(`%2C${genreIds.selectedGenre}`)
                }

            }

            const request = await httpRequest.get(url)
            // setMovies(request.data.results)
            setMovies({
                loading: false,
                data: request.results.slice(indexStart, indexEnd)
            })
            return request;
        }
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchUrl, indexStart, genreIds.selectedGenre, genreIds.selectedMovieGenre]);


    //get genre list
    useEffect(() => {
        async function fetchData() {
            const requestGenre = await httpRequest.get(fetchGenres)
            setGenres(requestGenre.genres)
            return requestGenre;
        }
        fetchData();
    }, [fetchGenres])

    //paging
    const listRef = useRef()

    const handleClick = (direction) => {
        if (direction === "left" && slideNum > 0) {
            setIsMovedRight(false)

            if (slideNum === 10) {
                // listRef.current.style = 'left: -12.3vw'
                setSlideNum(slideNum - 5)
                setIndexStart(7)
                setIndexEnd(15)
            } else {
                // listRef.current.style = 'left: 0vw'
                setIsMovedLeft(false)
                setSlideNum(slideNum - 5)
                setIndexStart(0)
                setIndexEnd(8)
            }
        }
        if (direction === "right" && slideNum < 10) {
            setIsMovedLeft(true)
            if (slideNum < 5) {
                // listRef.current.style = 'left: -12.3vw'
                setSlideNum(slideNum + 5)
                setIndexStart(7)
                setIndexEnd(15)
            } else {
                setIsMovedRight(true)
                setSlideNum(slideNum + 5)
                setIndexStart(14)
                setIndexEnd(20)
            }
        }
    }

    //handle mousemove
    const [isHover, setIsHover] = useState(false)



    return (
        <motion.div className={cx('row')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
        >

            <motion.h2 className={cx('row_title')}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >{title}</motion.h2>

            <div className={cx('slider', 'left-layer')}
                onClick={() => handleClick("left")}
                style={{ display: !isMovedLeft && "none" }}
            ></div>
            {isHover && <ArrowBackIosNewOutlinedIcon
                sx={{ fontSize: '3vw' }}
                className={cx('slider', 'left')}
                onClick={() => handleClick('left')}
                style={{ display: !isMovedLeft && "none" }}
            />}

            <div className={cx('row_posters')} ref={listRef}>

                <AnimatePresence>
                    {!movies.loading ? (movies.data.map((movie, index) => (
                        <React.Fragment key={movie.id}>
                            <MoviePoster setShowModal={setShowModal} index={index}
                                key={movie.id} baseUrl={baseUrl} movie={movie}
                                genres={genre} movieId={movie.id} type={type}
                            />
                        </React.Fragment>
                    ))) : [1, 2, 3, 4, 5, 6].map((n) => (
                        <Skeleton sx={{ bgcolor: 'grey.900' }} variant="rectangular" animation="wave" width={180} height={270} key={n} />
                    ))}

                </AnimatePresence>
            </div>

            <div className={cx('slider', 'right-layer')}
                onClick={() => handleClick('right')}
                style={{ display: IsMovedRight && "none" }}
            ></div>
            {isHover &&
                <ArrowForwardIosOutlinedIcon
                    sx={{ fontSize: '3vw' }}
                    className={cx('slider', 'right')}
                    onClick={() => handleClick('right')}
                    style={{ display: IsMovedRight && "none" }}
                />
            }
        </motion.div>
    )
}

export default memo(Row);
