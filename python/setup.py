import json
from setuptools import setup


with open("package.json") as f:
    package = json.load(f)

package_name = package["name"].replace(" ", "_").replace("-", "_")

INSTALL_REQUIRES = [
    "dash>=2.0",
    "numpy>=1.14",
    "pandas>=1.0",
]

TESTS_REQUIRE = [
    "bandit",
    "black>=20.8b1",
    "dash[testing]",
    "geojson>=2.5.0",
    "jsonpatch>=1.32",
    "jsonpointer>=2.1",
    "matplotlib>=3.0",
    "orjson>=3.8.2",
    "Pillow>=6.0",
    "pylint>=2.4",
    "scipy>=1.2",
    "selenium>=3.141",
    "vtk>=9.2.2",
    "webviz-core-components>=0.6.0",
    "xtgeo>=2.20.3",
]

setup(
    name=package_name,
    version=package["version"],
    author=package["author"],
    packages=[package_name],
    include_package_data=True,
    license=package["license"],
    description=package.get("description", package_name),
    install_requires=INSTALL_REQUIRES,
    tests_require=TESTS_REQUIRE,
    classifiers=[
        "Programming Language :: Python :: 3",
        "Operating System :: OS Independent",
        "Natural Language :: English",
        "Environment :: Web Environment",
        "Framework :: Dash",
        "Framework :: Flask",
        "Topic :: Multimedia :: Graphics",
        "Topic :: Scientific/Engineering",
        "Topic :: Scientific/Engineering :: Visualization",
        "License :: OSI Approved :: Mozilla Public License 2.0 (MPL 2.0)",
    ],
)
