import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  DndContext,
  closestCorners,
  //   KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  //   DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  rectIntersection,
  //   useSensor,
  //   useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { collection, doc, setDoc, addDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { round2digtNum } from "../utils";

// import { useSortable } from "@dnd-kit/sortable";

import Container from "./dnd_container"

import { Modal, Button } from 'react-bootstrap';

import { ReactComponent as PlusSvg } from './plus.svg';
import { ReactComponent as MinusSvg } from './minus.svg';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { faDivide } from '@fortawesome/free-solid-svg-icons';

import _ from 'lodash'; // Ensure lodash is imported


// import { Modal } from '@headlessui/react'; // Import Modal from headless UI


function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function createData_group(length, group) {
  return [...new Array(length)].map((_, index) => {
    return {
      id: uuid(),
      item: group[index % group.length], // Use items from the group cyclically
    };
  });
}

function createGroups(groupName, items) {
  const result = {};
  result[groupName] = createData_group(items.length, items);
  return result;
}



function Dnd_Test(props) {
  // const main_input = props.main_input;

  const main_input = JSON.parse(JSON.stringify(props.main_input));

  // const groupNames = ["A", "B", "C"];
  // const itemCounts = [4, 5, 4];
  const created_items = createGroups("group0", main_input);
  // const created_items = createGroups(initialItemGroups);
  console.log(created_items)

  const [items, setItems] = useState(created_items)
  // console.log(items);
  //   const [items, setItems] = useState({
  //     A: createData_group(4, (index) => `A${index + 1}`),
  //     B: createData_group(5, (index) => `B${index + 1}`),
  //     C: createData_group(4, (index) => `C${index + 1}`),
  //   });
  //   console.log(items)

  // setState to check if things are modified
  const [dirty, setDirty] = useState(false);

  const [activeId, setActiveId] = useState(null);

  // keeps the id of the prev container when the item is first dragged into another container without getting dropped end
  const [prev_container, setPrev_Container] = useState("")

  const [prev_index, setPrev_Index] = useState("")

  const [prev_quantity, setPrev_Quantity] = useState(0)

  const [current_item, setCurrent_Item] = useState({})

  const [end_container, setEnd_Container] = useState("")

  const [end_index, setEnd_Index] = useState("")


  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // for the modal when dragEnd occurs to move number of items

  // State variable to control the modal visibility
  const [showModal, setShowModal] = useState(false);

  // Function to show the modal
  const handleShowModal = (overContainer) => {
    setShowModal(true);
    console.log("the items at showModal: ", items);
  };

  // Function to hide the modal
  const handleCloseModal = () => {
    setShowModal(false);

    if (prev_quantity - quantity > 0) {
      // I want you to look into generate new item to put 
      let newItem = {
        id: uuid(),
        item: {
          ...current_item.item,
          quantity: prev_quantity - quantity,
          itemTotalPrice: Math.round(100 * current_item.item.itemTotalPrice / (current_item.item.quantity) * (prev_quantity - quantity)) / 100
        }
      };
      console.log("newItem: ", newItem)

      // Update the state to include the copied item in the original container at prev_index
      setItems((items) => {
        return {
          ...items,
          [prev_container]: [
            ...items[prev_container].slice(0, prev_index + 1),
            newItem,
            ...items[prev_container].slice(prev_index + 1),
          ],
        };
      });
      // add the newItem at end of the object in items[prev_container]
    }

  };

  function handleDragStart(event) {

    const activeId = event.active.id;
    console.log("start")
    console.log("activeid: ", event.active)
    if (event.active.id !== null) {
      const containerId = event.active.data.current.sortable.containerId;
      const container_items = event.active.data.current.sortable.items;
      // Find the key (index) of the activeId in the items object
      const keys = Object.keys(container_items);
      const index = keys.findIndex((key) => container_items[key] === activeId);
      console.log("index: ", index)
      console.log("containerId: ", containerId)

      setPrev_Index(index)
      setPrev_Container(containerId)
      const item = items[containerId][index]
      console.log("item: ", item)

      setCurrent_Item(item)
      // setting the quantity
      setQuantity(item.item.quantity)
      setPrev_Quantity(item.item.quantity)

    }
    setActiveId(activeId);
  }

  const handleDragCancel = () => setActiveId(null);

  const findContainer = useCallback((id) => {
    if (id in items) {
      return id;
    }
    return Object.keys(items).find((key) => {
      return items[key].some((item) => item.id === id);
    });
  }, [items]);

  // const [dragOverContainerChange, setDragOverContainerChange] = useState(true)

  // using a useCallback to avoid unnesscary re-renders causing maximum depth reached error
  const handleDragOver = useCallback((event) => {
    // Your existing handleDragOver code here
    const { active, over } = event;
    // console.log(event)
    const activeId = active.id;
    const overId = over?.id;

    // console.log(activeId)
    // console.log(overId)

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    // console.log("items: ", items)
    // console.log("handleDragO active: ", activeContainer)
    // console.log("handleDragO over: ", overContainer)

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    if (activeContainer !== overContainer) {
      console.log("from: ", activeContainer, " To: ", overContainer)
    }

    // ** try commenting out the setItems to fix maximum rendering loop ** // 
    setItems((items) => {
      const activeItems = items[activeContainer];
      const overItems = items[overContainer];

      const activeIndex = activeItems?.findIndex((item) => item.id === activeId);
      const overIndex = overItems?.findIndex((item) => item.id === overId);
      let newIndex;
      if (overId in items) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top >
          over.rect.top + over.rect.height;
        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }
      return {
        ...items,
        [activeContainer]: items[activeContainer].filter((item) => item.id !== active.id),
        [overContainer]: [
          ...items[overContainer].slice(0, newIndex),
          items[activeContainer][activeIndex],
          ...items[overContainer].slice(newIndex, items[overContainer].length),
        ],
      };
    });

  }, [setItems, findContainer]); // Ensure to include any dependencies that affect the function



  function handleDragEnd(event) {

    // set the items for dragOver
    // setItems(items_copy)

    const { active, over } = event;

    const activeId = active.id;
    const overId = over.id;
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    console.log("handleDragEnd active: ", activeContainer)
    console.log("handleDragEnd over: ", overContainer)


    // Prevent cross-container drops (if needed)

    if (!activeContainer || !overContainer || activeContainer !== overContainer) {

      return;
    }

    const activeIndex = items[activeContainer]?.findIndex((item) => item.id === activeId);
    const overIndex = items[overContainer].findIndex((item) => item.id === overId);

    // copy over the overIndex into end_index
    // copy over the overContainer into end_container
    setEnd_Container(overContainer)
    setEnd_Index(overIndex)

    console.log("handleDragEnd activeIndex: ", activeIndex)
    console.log("handleDragEnd overIndex: ", overIndex)

    if (activeIndex !== overIndex) {
      setItems((items) => ({
        ...items,
        [overContainer]: arrayMove(items[overContainer], activeIndex, overIndex),
      }));
    }

    setActiveId(null);

    if (prev_container !== overContainer) {
      // opens the modal and lets the user input data
      // setEnd_Container(overContainer)

      // change the dirty to true because something is modified
      setDirty(true)

      console.log("dragEnd from group: ", prev_container, " to group: ", overContainer)

      // Check if the End_container already has two similar items
      if (items[overContainer]) {
        console.log("in item[overContainer]: ", items[overContainer]);

        let otherItems = items[overContainer].filter(
          (item) =>
            item.item.id !== current_item.item.id ||
            item.item.count !== current_item.item.count
        )
        const existingItems = items[overContainer].filter(
          (item) =>
            item.item.id === current_item.item.id &&
            item.item.count === current_item.item.count
        );
        console.log("existingItems: ", existingItems);

        // Check if there are two similar items
        if (existingItems.length === 2) {
          const totalQuantity = existingItems.reduce(
            (sum, item) => sum + item.item.quantity,
            0
          );

          const totalItemTotalPrice = existingItems.reduce(
            (sum, item) => sum + item.item.itemTotalPrice,
            0
          );

          console.log("existing item is 2");

          // Keep only the item with the same id as current_item
          const updatedItems = items[overContainer].filter(
            (item) => item.id === current_item.id
          );

          // Update the quantity of the kept item with the total quantity
          if (updatedItems.length === 1) {
            updatedItems[0].item.quantity = totalQuantity;
            updatedItems[0].item.itemTotalPrice = totalItemTotalPrice;

          }

          // ** push updatedItem[0] onto otherItems at index end_index **
          otherItems.splice(end_index, 0, updatedItems[0]);

          // Update the state with the modified items in the overContainer
          setItems((prevItems) => {
            const updatedContainers = {
              ...prevItems,
              [overContainer]: otherItems,
            };
            return updatedContainers;
          });
        }
      }
      // if there is only 1 item, no need to show modal
      if (quantity !== 1) {
        handleShowModal(overContainer);
      }
    }
  }

  const [numberOfGroups, setNumberOfGroups] = useState(1); // Initialize with the next available group number

  function addEmptyGroup() {
    const newGroupName = `group${Object.keys(items).length}`;
    const main_input = JSON.parse(JSON.stringify(props.main_input));
    if (dirty === false) {
      setItems((prevItems) => ({
        ...prevItems,
        [newGroupName]: createData_group(main_input.length, main_input),
        // [newGroupName]: [],

      }));
    }

    if (dirty === true) {
      setItems((prevItems) => ({
        ...prevItems,
        // [newGroupName]: createData_group(main_input.length, main_input),
        [newGroupName]: [],

      }));
    }
    // console.log(items)

    // Increment numberOfGroups by 1
    if (dirty === false) {
      setNumberOfGroups(numberOfGroups + 1);
    }

  }

  // const calculateNextGroupNumber = () => {
  //   const groupKeys = Object.keys(items);

  //   // Filter out the 'main' group
  //   const groupNumbers = groupKeys
  //     .filter((key) => key !== 'main')
  //     .map((key) => parseInt(key.match(/\d+/)[0]))
  //     .sort((a, b) => a - b);

  //   let nextGroupNumber = 1;

  //   // Find the first gap in the sequence of group numbers
  //   for (const groupNumber of groupNumbers) {
  //     if (groupNumber !== nextGroupNumber) {
  //       return nextGroupNumber;
  //     }
  //     nextGroupNumber++;
  //   }

  //   // If there are no gaps, return the next number in sequence
  //   return nextGroupNumber;
  // };



  const handleDelete = useCallback((groupIdToDelete) => {
    // Check if the groupIdToDelete is "main" and prevent deletion
    if (groupIdToDelete === "group0") {
      // Handle the case where the "main" group should not be deleted
      // You can show a message or perform any other action as needed.
      console.warn("The 'group0' group cannot be deleted.");
      return;
    }

    const updatedItemGroups = { ...items };

    // the below code is move all the items from deleted column to main
    if (dirty === true) {
      // Move all items to "main" if it's not the "main" group
      updatedItemGroups["group0"] = [
        ...updatedItemGroups["group0"],
        ...updatedItemGroups[groupIdToDelete],
      ];

      // Combine items in "main" with the same id and count
      const mainItems = updatedItemGroups["group0"];
      const combinedMainItems = mainItems.reduce((acc, item) => {
        const existingItem = acc.find(
          (combinedItem) =>
            combinedItem.item.id === item.item.id &&
            combinedItem.item.count === item.item.count
        );

        if (existingItem) {
          existingItem.item.quantity += item.item.quantity;
          existingItem.item.itemTotalPrice += item.item.itemTotalPrice;
        } else {
          acc.push({ ...item });
        }

        return acc;
      }, []);

      updatedItemGroups["group0"] = combinedMainItems;
    }

    // Delete the group (except for "main")
    delete updatedItemGroups[groupIdToDelete];

    // Renumber the group keys
    const groupKeys = Object.keys(updatedItemGroups)
      .filter((key) => key !== "group0")
      .sort((a, b) => {
        const groupNumberA = parseInt(a.match(/\d+/)[0]);
        const groupNumberB = parseInt(b.match(/\d+/)[0]);
        return groupNumberA - groupNumberB;
      });

    // Update the group keys
    groupKeys.forEach((groupKey, index) => {
      const newGroupKey = `group${index + 1}`;
      updatedItemGroups[newGroupKey] = updatedItemGroups[groupKey];
      if (groupKey !== newGroupKey) {
        delete updatedItemGroups[groupKey];
      }
    });

    // Decrement the numberOfGroups by 1
    if (dirty === false) {
      setNumberOfGroups(numberOfGroups - 1);
    }

    setItems(updatedItemGroups);
  }, [items, setItems]);

  const checkout = useCallback((containerId) => {
    // returns the JSON Object of the specific containerId

    console.log(items[containerId]);
    console.log(numberOfGroups);

    // Extracting and creating a deep copy of all 'item' fields from the items[containerId]
    const itemsArray = items[containerId] ? Object.values(items[containerId]).map(obj => _.cloneDeep(obj.item)) : [];

    // Modifying 'CHI' and 'name' fields in each item of itemsArray
    const updatedItemsArray = itemsArray.map(item => {
      if (numberOfGroups > 1) {
        // if (item.CHI) {
        //   item.CHI += ` / ${numberOfGroups}`;
        // }
        if (item.name) {
          item.name = `#@%${numberOfGroups}#@%` + item.name;
        }

        // Divide itemTotalPrice and subtotal by numberOfGroups and fix to 2 decimal places
        if (item.itemTotalPrice) {
          item.itemTotalPrice = (item.itemTotalPrice / numberOfGroups)

        }
        if (item.subtotal) {
          item.subtotal = (item.subtotal / numberOfGroups)

        }
      }
      return item;
    });
    console.log(JSON.stringify(updatedItemsArray));

    return (updatedItemsArray)
    // Log the new array to see the result
    console.log(JSON.stringify(updatedItemsArray));

    // Optionally, you can return the updatedItemsArray if needed
    //  return updatedItemsArray;

  }, [items, numberOfGroups]); // Add numberOfGroups to the dependency array

  // localStorage.setItem("splitTotalPrice", props.totalPrice)
  const [isPaidArray, setIsPaidArray] = useState([]);

  const containerItems = useMemo(() => {

    return Object.keys(items)
      .map((key) =>
        isPaidArray.includes(key) ? (
          <div key={key}><span className="notranslate">✅&nbsp;{key}&nbsp;</span> is paid&nbsp;</div>
        ) : (
          <Container
            store={props.store}
            acct={props.acct}
            selectedTable={props.selectedTable}
            key={key}
            containerId={key}
            items={items[key]}
            handleDelete={handleDelete}
            checkout={checkout}
            updateItems={setItems}
            whole_item_groups={items}
            numberOfGroups={numberOfGroups}
            dirty={dirty}
            activeId={activeId}
            TaxRate={props.TaxRate}
            isPaidArray={isPaidArray}
            setIsPaidArray={setIsPaidArray}
          />
        )
      );
  }, [items, handleDelete, checkout, isPaidArray]); // 确保 `isPaidArray` 变化时重新计算


  // state to display the items in modal (used in handle Plus Minus Clicks)
  const [quantity, setQuantity] = useState(current_item.item?.quantity || 0);

  const handlePlusClick = () => {
    console.log("prev_quantity: ", prev_quantity)

    if (quantity + 1 <= prev_quantity) {

      // let newItemTotalPrice = (current_item.item.itemTotalPrice / current_item.item.quantity) * (current_item.quan)
      setQuantity(Math.min(quantity + 1, prev_quantity))


      // ** issue is that the itemTotalPrice is wrongly calculated ** //

      let temp_item = current_item
      console.log("temp_item", temp_item.item)
      temp_item.item.itemTotalPrice = Math.round(100 * current_item.item.itemTotalPrice / (current_item.item.quantity) * (current_item.item.quantity + 1)) / 100
      temp_item.item.quantity = current_item.item.quantity + 1
      console.log("temp_item.item.quantity")
      // console.log("temp_item.item", temp_item.item.quantity)
      // temp_item.item.itemTotalPrice = Math.round(100 * current_item.item.itemTotalPrice / (current_item.item.quantity) * (current_item.item.quantity + 1)) / 100
      // setQuantity(temp_item.item.quantity)
      setCurrent_Item(temp_item)

    }
    // let newItem = {
    //   id: uuid(),
    //   item: {
    //     ...temp_item.item,
    //     quantity: prev_quantity - temp_item.item.quantity,
    //     itemTotalPrice: Math.round(100 * current_item.item.itemTotalPrice / (prev_quantity - temp_item.item.quantity) * (prev_quantity - temp_item.item.quantity)) / 100
    //   }
    // };
    // console.log("newItem: ", newItem)

    // setCurrent_Item()
    // current_item.item.quantity = Math.min(current_item.item.quantity + 1, prev_quantity)
  };

  const handleMinusClick = () => {

    if (quantity - 1 > 0) {
      setQuantity(Math.max(quantity - 1, 1))

      // const prev_quantity = current_item.item.quantity
      // console.log("current_item: ", current_item)

      // // handle minus click 
      let temp_item = current_item
      console.log("temp_item", temp_item.item)
      temp_item.item.itemTotalPrice = Math.round(100 * current_item.item.itemTotalPrice / (current_item.item.quantity) * (current_item.item.quantity - 1)) / 100
      temp_item.item.quantity = current_item.item.quantity - 1
      console.log("temp_item.item.quantity")
      console.log("temp_item.item", temp_item.item.quantity)
      // setQuantity(temp_item.item.quantity)
      setCurrent_Item(temp_item)
    }

    // setQuantity(temp_item.item.quantity)
    // current_item.item.quantity = Math.max(current_item.item.quantity - 1, 1)
  };


  // // Use useEffect to update quantity whenever current_item changes
  // useEffect(() => {
  //   // Update the quantity value when current_item changes
  //   setQuantity(current_item.item?.quantity || 0);
  // }, [current_item]);
  // console.log(items)

  function Item({ item, numberOfGroups }) {

    console.log("In Item for dnd_test: ", item)
    console.log("In Item for dnd_test numberOfGroups: ", numberOfGroups)
    function flattenAttributes(attributes) {
      function flattenObject(obj, prefix = "") {
        return Object.keys(obj).reduce((acc, key) => {
          const value = obj[key];
          const currentKey = key;

          if (Array.isArray(value)) {
            // If the value is an array, join its elements and add to the result
            const flattenedArray = value.join(" ");
            return acc + flattenedArray + "<br />";
          } else if (typeof value === "object" && !Array.isArray(value)) {
            // If the value is an object, recursively flatten it
            return acc + flattenObject(value, currentKey);
          } else {
            // If the value is neither an object nor an array, add it to the result
            return acc + value + "<br />";
          }
        }, "");
      }

      return flattenObject(attributes).trim();
    }

    function generateAttributes(attributes) {
      const attributeString = flattenAttributes(attributes);
      if (attributeString === "") {
        return null; // Return null if there are no attributes
      } else {
        return (
          <div dangerouslySetInnerHTML={{ __html: attributeString }} />
        );
      }
    }

    return (
      <div className="w-full flex flex-col gap-2 rounded-md bg-white p-4 border-1 border-gray-800">
        {/* <p className="font-bold text-2xl">{heading}</p>
        <p className="text-gra7-700 font-thin">{description}</p> */}
        {/* <p className="font-bold text-2xl">{item.name}</p> */}
        <span className="notranslate">

          {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? (item?.CHI) : (item?.name)}&nbsp;x&nbsp;
          <b>{
            Math.round((Math.round(item.quantity) / Math.round(numberOfGroups)) * 100) / 100
          }</b>

          {generateAttributes(item.attributeSelected)}
        </span>
        {/* <p className="font-bold text-2xl">{item.quantity}</p> */}
      </div>
    );
  }


  function SortableItem(props) {
    const { id, item, numberOfGroups } = props;
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition
    } = useSortable({ id });

    const style = {
      transform: transform
        ? `translate3d(${transform.x}px, ${Math.round(
          transform.y
        )}px, 0) scaleX(${transform.scaleX})`
        : "",
      transition
    };

    // console.log("sortableItem: ", whole_item_groups)
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <Item id={id} item={item} numberOfGroups={numberOfGroups} />
      </div>
    );
  }


  return (
    <div className="flex flex gap-4 p-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        // Add the following line to disable collision detection outside of containers
        // modifiers={activeId ? [restrictToContainer] : []}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      // autoScroll={false}
      // autoScroll={{
      //   enabled: true,
      //   threshold: {
      //     x: 0.2,
      //     y: 0.2,
      //   },
      //   speed: {
      //     x: 20,
      //     y: 10,
      //   },
      // }}
      >
        {/* <div style={{width:"100%" ,overflowX:"auto", }}> */}

        {containerItems}
        {/* </div> */}


        {/* Add the Bootstrap button */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
          <Button style={{ backgroundColor: "#007bff", color: "white", fontSize: "16px", padding: "10px 20px", borderRadius: "8px", width: "220px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }} onClick={addEmptyGroup}>
            <span>Add New Group</span>
          </Button>

          <Button style={{ backgroundColor: "#004494", color: "white", fontSize: "16px", padding: "10px 20px", borderRadius: "8px", width: "220px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }} onClick={() => setDirty(true)}>
            <span>Set Min Unit: {Math.round(numberOfGroups) === 1 ? '' : '1/'}<span className="notranslate">{Math.round(numberOfGroups)}</span></span>
          </Button>
        </div>







        {/* Modal component */}
        {showModal && (
          <div
            id="Modal"
            className="modal fade show"
            role="dialog"
            style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          >
            <div className="modal-dialog modal-lg" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Select Quantity</h5>
                </div>

                <div className="modal-body text-center">
                  <p className="text-lg font-semibold">
                    Adjust quantity by{" "}
                    <span>
                      {Math.round(numberOfGroups) === 1 ? "" : "1/"}
                      <span className="notranslate font-bold">{Math.round(numberOfGroups)}</span>
                    </span>
                  </p>

                  {/* Quantity Control */}
                  <div className="flex justify-center items-center gap-4 mt-4">

                    {/* Minus Button */}
                    <div className="p-3 rounded-full border border-black hover:bg-gray-200 transition">
                      <button
                        className="w-14 h-14 flex items-center justify-center"
                        onClick={handleMinusClick}
                      >
                        <MinusSvg className="w-8 h-8" alt="Decrease" />
                      </button>
                    </div>

                    {/* Quantity Display */}
                    <span className="notranslate w-20 h-20 flex items-center justify-center text-4xl font-semibold">
                      {Math.round((Math.round(quantity) / Math.round(numberOfGroups)) * 100) / 100}
                    </span>

                    {/* Plus Button */}
                    <div className="p-3 rounded-full border border-black hover:bg-gray-200 transition">
                      <button
                        className="w-14 h-14 flex items-center justify-center"
                        onClick={handlePlusClick}
                      >
                        <PlusSvg className="w-8 h-8" alt="Increase" />
                      </button>
                    </div>

                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleCloseModal()}
                  >
                    confirm
                  </button>

                </div>
              </div>
            </div>
          </div>
        )}

        <DragOverlay>
          {activeId && <SortableItem className="bordered" id={activeId} item={current_item.item} numberOfGroups={numberOfGroups} />}
        </DragOverlay>

      </DndContext>
      {/* </DndContext> */}
    </div>
  );
}

export default Dnd_Test;
