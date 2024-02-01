import React from "react"
import styles from './styles.module.css'
import HomepageButton from '@site/src/components/HomepageButton';
import GestureFeatureList from "@site/src/components/GestureFeatures/GestureFeatureList";
import Wave from '@site/src/components/Wave'

const GestureFeatures = () => {
    return (
        <div className={styles.featuresContainer}> 
            <h2 className={styles.title}>Why Gesture Handler?</h2> 
            <GestureFeatureList />
            {/* <div className={styles.waveContainer}>
                <Wave />
            </div> */}
            <div className={styles.learnMoreSection}>
                <p>
                Learn more about the features in the newest article about Gesture Handler
                </p>
                <HomepageButton
                href="/react-native-gesture-handler/docs/"
                title="See blog post"
                backgroundStyling={styles.featuresButton}
                />
            </div>
        </div>

    )
}

export default GestureFeatures