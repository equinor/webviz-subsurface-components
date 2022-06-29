if [[ -d react/cypress/snapshots/diff ]]
then
    echo "::set-output name=docs_changed::true"
else
    echo "::set-output name=docs_changed::false"
fi