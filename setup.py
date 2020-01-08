import os
import json
from setuptools import setup


with open("README.md", "r") as fh:
    long_description = fh.read()

with open(os.path.join("webviz_subsurface_components", "package.json")) as f:
    package = json.load(f)

package_name = package["name"].replace(" ", "_").replace("-", "_")

install_requires = ["dash~=1.6"]

tests_require = [
    "black~=19.10b0",
    "matplotlib~=3.0",
    "numpy~=1.14",
    "pandas~=0.25",
    "Pillow~=6.0",
    "pylint~=2.4",
    "scipy~=1.2",
    "selenium~=3.141",
]

# 'dash[testing]' to be added in tests_require when
# https://github.com/pypa/pip/issues/4957 is closed.

setup(
    name=package_name,
    author=package["author"],
    packages=[package_name],
    include_package_data=True,
    license=package["license"],
    description=package["description"],
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/equinor/webviz-subsurface-components",
    install_requires=install_requires,
    tests_require=tests_require,
    extras_require={"tests": tests_require, "dependencies": install_requires},
    setup_requires=["setuptools_scm~=3.2"],
    use_scm_version=True,
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
        "License :: OSI Approved :: GNU Lesser General Public License v3 (LGPLv3)",
    ],
)
