git ls-files --others --exclude-standard > files.txt
while IFS= read -r file
do
    if [[ $file = react/cypress/snapshots/diff/* ]]; then
        echo $file >> files2.txt
    fi
        done < files.txt

while IFS= read -r file
do
    # find the corresponding actual file
    modified_actual=${file::-8}actual.png

    # find the paths of the actual snapshots
    actual_snapshots=${modified_actual/diff/actual}

    # replace the last characters with "base" string
    replace_string=${actual_snapshots::-10}base.png

    # base file location
    base_snapshots=${replace_string/actual/base}

    # rename the file
    mv $actual_snapshots $replace_string 

    # move the file in base directory
    mv $replace_string $base_snapshots
    
    done < files2.txt

#mv react/cypress/snapshots/actual/deckgl_map/layer_selection.ts/this_is_image-actual.png react/cypress/snapshots/actual/deckgl_map/layer_selection.ts/this_is_image-base.png
#mv react/cypress/snapshots/actual/deckgl_map/layer_selection.ts/this_is_image-base.png react/cypress/snapshots/base/deckgl_map/layer_selection.ts/this_is_image-base.png