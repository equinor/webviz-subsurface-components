git ls-files --others --exclude-standard > files.txt
while IFS= read -r file
do
    if [[ $file = react/cypress-visual-screenshots/diff/* ]]; then
        echo $file >> files2.txt
    fi
        done < files.txt

while IFS= read -r file
do
    snapshot_name=${file:44}
    baseline_location=react/cypress-visual-screenshots/baseline/${snapshot_name}
    actual_location=react/cypress-visual-screenshots/comparison/${snapshot_name}

    # move the actual snapshot to base directory
    mv $actual_location $baseline_location
    
    done < files2.txt

#mv react/cypress/snapshots/actual/deckgl_map/layer_selection.ts/this_is_image-actual.png react/cypress/snapshots/actual/deckgl_map/layer_selection.ts/this_is_image-base.png
#mv react/cypress/snapshots/actual/deckgl_map/layer_selection.ts/this_is_image-base.png react/cypress/snapshots/base/deckgl_map/layer_selection.ts/this_is_image-base.png