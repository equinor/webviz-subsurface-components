import React from "react";

interface scaleProps {
    zoom: number;
}

const DistanceScale: React.FC<scaleProps> = ({ zoom }: scaleProps) => {
    //prop
    const widthPerUnit = 5;
    const [width, setWidth] = React.useState<number>(100);
    // width in units
    const widthInUnits = Math.round(widthPerUnit / Math.pow(2, zoom));
    //const [currentValues, setCurrentValues] = React.useState<number>();
    
    const scaleBarStyle = {
        width: width,
        height: "4px",
        border: "2px solid gray",
        borderTop: "none",
        display: "inline-block",
        marginLeft: "3px",
        marginRight: "3px",
        right: 0,
        bottom: 0,
    };

    const values = function(num:number, step: number) 
        { return Math.floor((num / step) + .5) * step; 
    }

    var incrementValue = 10
    // round off value for width in unit
    var currentValues = values(widthInUnits, incrementValue);

    console.log('currentValues::', currentValues)

    React.useEffect(() => {
        // props, must be transfered to unit
        var min = 1;
        var max = 300;

        // if(currentValues >  previousValues) {
        //     setScaleWidth(scaleWidth + incrementValue)
        // } else if(currentValues <  previousValues) {
        //     setScaleWidth(scaleWidth - incrementValue)
        // }

        // setPreviousWidthInUnits(currentValues)
        
        // // pixel value (change the width of the ruler: small, big)
        const clamp = (currentValues: number, min: number, max: number) => {
            //console.log('scaleWidth:', scaleWidth)
            if(currentValues > max){
                return max;
            } else if(currentValues < min){
              return min
            } else {
                return currentValues;
            }
        }

        console.log('currentValues::', currentValues)

        setWidth(clamp(currentValues, min, max)) 
    }, [zoom]);

    return (
        <div style={{ bottom: 0, right: 0, position: "absolute" }}>
            {/* <label>{parseFloat(widthInUnits.toFixed(2))}</label> */}
            <label>{currentValues}</label>
            <div style={scaleBarStyle}></div>
        </div>
    );
};

export default DistanceScale;
