import { useState } from 'react';

const useDynamicAttributes = () => {

    // Initialize a variable with your JSON object


    const initialAttributesJson = {
        "isSingleSelected": false,
        "variations": [
            {
                "type": "a",
                "price": 0
            }
        ]
    };
    const transformJsonToInitialState = (jsonObject) => {
        const initialState = {};

        for (const attributeName in jsonObject) {
            if (jsonObject.hasOwnProperty(attributeName)) {
                initialState[attributeName] = {
                    isSingleSelected: jsonObject[attributeName].isSingleSelected,
                    variations: jsonObject[attributeName].variations
                };
            }
        }
        return initialState;
    };

    const [attributes, setAttributes] = useState({
        "加蛋": {
            "isSingleSelected": false,
            "variations": [
                {
                    "type": "加蛋",
                    "price": 1.5
                }
            ]
        }
    });
    const [currentAttribute, setCurrentAttribute] = useState('');
    const [currentVariation, setCurrentVariation] = useState({ type: '', price: '' });
    const [priceFormatError, setPriceFormatError] = useState(null);

    const addOrUpdateAttributeVariation = () => {
        console.log("currentVariation")
        console.log(JSON.stringify(currentVariation))
        console.log(JSON.stringify(attributes))
        const trimmedAttribute = currentAttribute.trim();
        const trimmedVariationType = currentVariation.type.trim();

        if (trimmedAttribute === '' || trimmedVariationType === '') {
            setPriceFormatError('Attribute and variation type cannot be empty.');
            return;
        }

        let enteredPrice = String(currentVariation.price).trim();
        const validFormat = /^[-]?\d+(\.\d{1,2})?$/.test(enteredPrice);
        if (enteredPrice === "") {
            enteredPrice = 0;
        }
        else if (!validFormat) {
            setPriceFormatError('Invalid price format. Use: 1.2, 1.23, -2.3, etc.');
            return;
        }

        setAttributes(prev => {
            const updatedAttributes = { ...prev };
            const newVariation = { type: trimmedVariationType, price: parseFloat(enteredPrice) };

            if (!updatedAttributes[trimmedAttribute]) {
                updatedAttributes[trimmedAttribute] = {
                    isSingleSelected: false,
                    variations: []
                };
            }

            const variationIndex = updatedAttributes[trimmedAttribute].variations.findIndex(v => v.type === trimmedVariationType);
            if (variationIndex === -1) {
                updatedAttributes[trimmedAttribute].variations.push(newVariation);//push
            } else {
                updatedAttributes[trimmedAttribute].variations[variationIndex] = newVariation;//set new
            }

            return updatedAttributes;
        });

        setCurrentAttribute('');
        setCurrentVariation({ type: '', price: '' });
    };

    const deleteVariation = (attributeName, index) => {
        console.log("deleteVariation")

        setAttributes(prev => {
            const updatedAttributes = { ...prev };
            if (updatedAttributes[attributeName]) {
                updatedAttributes[attributeName].variations.splice(index, 1);
                if (updatedAttributes[attributeName].variations.length === 0) {
                    delete updatedAttributes[attributeName];
                }
            }
            return updatedAttributes;
        });
    };

    const deleteAttribute = (attributeName) => {
        console.log("deleteAttribute")

        setAttributes(prev => {
            const updatedAttributes = { ...prev };
            delete updatedAttributes[attributeName];
            return updatedAttributes;
        });
    };

    const toggleMultiSelect = (attributeName, singleSelect) => {
        console.log("toggleMultiSelect")
        setAttributes(prev => {
            const updatedAttributes = { ...prev };
            if (updatedAttributes[attributeName]) {
                updatedAttributes[attributeName].isSingleSelected = singleSelect;
            }
            return updatedAttributes;
        });
    };
    const resetAttributes = (customValue = {}) => {
        if (Object.keys(customValue).length !== 0) {
            console.log("inittt2");
            console.log(customValue);
        }
        setAttributes(customValue);
    };

    return {
        attributes,
        currentAttribute,
        setCurrentAttribute,
        currentVariation,
        setCurrentVariation,
        priceFormatError,
        addOrUpdateAttributeVariation,
        deleteVariation,
        deleteAttribute,
        toggleMultiSelect,
        resetAttributes, // Expose the reset function

    };
};

export default useDynamicAttributes;
