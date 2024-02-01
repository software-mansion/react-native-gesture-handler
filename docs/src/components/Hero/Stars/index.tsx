import React from "react"
import Stars from '@site/static/img/stars.svg'
import styles from './styles.module.css'

const HeroStars = () => {
    return <div className={styles.stars}>
        <Stars/>
    </div>
}

export default HeroStars