import React from "react"
import styles from './styles.module.css'
import Planets from '@site/src/components/Hero/Planets/PlanetsIcon'

const HeroPlanets = () => {
    return (
        <div className={styles.planets}>
            <Planets />
        </div>
    )
}

export default HeroPlanets