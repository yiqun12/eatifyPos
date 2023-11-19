import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import Container from "./dnd_container"

import { Modal, Button } from 'react-bootstrap';

import { ReactComponent as PlusSvg } from './plus.svg';
import { ReactComponent as MinusSvg } from './minus.svg';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

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

// let main_input = [
//   {
//     id: "207d3107-1532-4084-ab3b-b62ceda0b75c",
//     name: "Porterhouse for Two",
//     subtotal: 1,
//     image:
//       "https://img2.baidu.com/it/u=1076400451,2339714653&fm=253&fmt=auto&app=138&f=JPEG?w=667&h=500",
//     quantity: 2,
//     attributeSelected:{"Weight":["18 oz","20oz"],"size":"bg"},
//     count: "97d41dc1-4530-4ea5-ac05-9d9b97e5fd8b",
//     itemTotalPrice: 60,
//     CHI: "上等腰肉牛排二人份",
//   },
//   {
//     id: "277d3107-1532-4084-ab3b-b62ceda0b75c",
//     name: "Porterhouse for Two",
//     subtotal: 1,
//     image:
//       "https://img2.baidu.com/it/u=1076400451,2339714653&fm=253&fmt=auto&app=138&f=JPEG?w=667&h=500",
//     quantity: 1,
//     attributeSelected:{"Weight":["18 oz","20oz"],"size":"bg"},
//     count: "97d41dc1-4530-4ea5-ac05-9d9b97e5fd8b",
//     itemTotalPrice: 30,
//     CHI: "上等腰肉牛排二人份",
//   },
//   {
//     id: "2700d3107-1532-4084-ab3b-b62ceda0b75c",
//     name: "Porterhouse for Two",
//     subtotal: 1,
//     image:
//       "https://img2.baidu.com/it/u=1076400451,2339714653&fm=253&fmt=auto&app=138&f=JPEG?w=667&h=500",
//     quantity: 1,
//     attributeSelected:{"Weight":["18 oz","20oz"],"size":"bg"},
//     count: "97d41dc1-4530-4ea5-ac05-9d9b97e5fd8b",
//     itemTotalPrice: 30,
//     CHI: "上等腰肉牛排二人份",
//   },
//   {
//     id: "27723d3107-1532-4084-ab3b-b62ceda0b75c",
//     name: "Porterhouse for Two",
//     subtotal: 1,
//     image:
//       "https://img2.baidu.com/it/u=1076400451,2339714653&fm=253&fmt=auto&app=138&f=JPEG?w=667&h=500",
//     quantity: 1,
//     attributeSelected:{"Weight":["18 oz","20oz"],"size":"bg"},
//     count: "97d41dc1-4530-4ea5-ac05-9d9b97e5fd8b",
//     itemTotalPrice: 30,
//     CHI: "上等腰肉牛排二人份",
//   },
//   {
//     id: "27723d31232307-1532-4084-ab3b-b62ceda0b75c",
//     name: "Porterhouse for Two",
//     subtotal: 1,
//     image:
//       "https://img2.baidu.com/it/u=1076400451,2339714653&fm=253&fmt=auto&app=138&f=JPEG?w=667&h=500",
//     quantity: 1,
//     attributeSelected:{"Weight":["18 oz","20oz"],"size":"bg"},
//     count: "97d41dc1-4530-4ea5-ac05-9d9b97e5fd8b",
//     itemTotalPrice: 30,
//     CHI: "上等腰肉牛排二人份",
//   },
//   {
//     id: "27723d3232107-1532-4084-ab3b-b62ceda0b75c",
//     name: "Porterhouse for Two",
//     subtotal: 1,
//     image:
//       "https://img2.baidu.com/it/u=1076400451,2339714653&fm=253&fmt=auto&app=138&f=JPEG?w=667&h=500",
//     quantity: 1,
//     attributeSelected:{"Weight":["18 oz","20oz"],"size":"bg"},
//     count: "97d41dc1-4530-4ea5-ac05-9d9b97e5fd8b",
//     itemTotalPrice: 30,
//     CHI: "上等腰肉牛排二人份",
//   },
//   {
//     id: "27723d3107323-1532-4084-ab3b-b62ceda0b75c",
//     name: "Porterhouse for Two",
//     subtotal: 1,
//     image:
//       "https://img2.baidu.com/it/u=1076400451,2339714653&fm=253&fmt=auto&app=138&f=JPEG?w=667&h=500",
//     quantity: 1,
//     attributeSelected:{"Weight":["18 oz","20oz"],"size":"bg"},
//     count: "97d41dc1-4530-4ea5-ac05-9d9b97e5fd8b",
//     itemTotalPrice: 30,
//     CHI: "上等腰肉牛排二人份",
//   },
// ]

// ,
//   {
//     id: "277d3107-1532-4084-ab3b-b62ceda0b75c",
//     name: "Porterhouse for Two",
//     subtotal: 1,
//     image:
//       "https://img2.baidu.com/it/u=1076400451,2339714653&fm=253&fmt=auto&app=138&f=JPEG?w=667&h=500",
//     quantity: 5,
//     attributeSelected:{"Weight":["18 oz","20oz"],"size":"bg"},
//     count: "97d41dc1-4530-4ea5-ac05-9d9b97e5fd8b",
//     itemTotalPrice: 30,
//     CHI: "上等腰肉牛排二人份",
//   },
//   {
//     id: "217d3107-1532-4084-ab3b-b62ceda0b75c",
//     name: "Porterhouse for Two",
//     subtotal: 1,
//     image:
//       "https://img2.baidu.com/it/u=1076400451,2339714653&fm=253&fmt=auto&app=138&f=JPEG?w=667&h=500",
//     quantity: 5,
//     attributeSelected:{"Weight":["18 oz","20oz"],"size":"bg"},
//     count: "97d41dc1-4530-4ea5-ac05-9d9b97e5fd8b",
//     itemTotalPrice: 30,
//     CHI: "上等腰肉牛排二人份",
//   },

// function createItem(group)

function Dnd_Test(props) {
  const main_input = props.main_input;

    // const groupNames = ["A", "B", "C"];
    // const itemCounts = [4, 5, 4];
    const created_items = createGroups("main", main_input);
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


  const [activeId, setActiveId] = useState(null);

    // keeps the id of the prev container when the item is first dragged into another container without getting dropped end
    const [ prev_container, setPrev_Container ] = useState("")

    const [prev_index, setPrev_Index ] = useState("")

    const [prev_quantity, setPrev_Quantity] = useState(0)

    const [ current_item, setCurrent_Item ] = useState({})

    const [end_container, setEnd_Container ] = useState("")

    const [ end_index, setEnd_Index ] = useState("")

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

  function addEmptyGroup() {
    const newGroupName = `group${Object.keys(items).length}`;
    setItems((prevItems) => ({
      ...prevItems,
      [newGroupName]: [],
    }));
    // console.log(items)
  }

  const [nextGroupNumber, setNextGroupNumber] = useState(1); // Initialize with the next available group number

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
    if (groupIdToDelete === "main") {
      // Handle the case where the "main" group should not be deleted
      // You can show a message or perform any other action as needed.
      console.warn("The 'main' group cannot be deleted.");
      return;
    }
  
    const updatedItemGroups = { ...items };
  
    // Move all items to "main" if it's not the "main" group
    updatedItemGroups["main"] = [
      ...updatedItemGroups["main"],
      ...updatedItemGroups[groupIdToDelete],
    ];
  
    // Combine items in "main" with the same id and count
    const mainItems = updatedItemGroups["main"];
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
  
    updatedItemGroups["main"] = combinedMainItems;
  
    // Delete the group (except for "main")
    delete updatedItemGroups[groupIdToDelete];
  
    // Renumber the group keys
    const groupKeys = Object.keys(updatedItemGroups)
      .filter((key) => key !== "main")
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
  
    setItems(updatedItemGroups);
  }, [items, setItems]);
  
  const checkout = useCallback((containerId) => {
    // Calculate the total price for items in main
    console.log("items: ", items);
    const mainItems = items["main"];
    const totalGroup1Price = mainItems.reduce((total, item) => {
      return total + item.item.itemTotalPrice;
    }, 0);
  
    // Calculate the total price for items in the specified container
    const containerItems = items[containerId];
    const totalContainerPrice = containerItems.reduce((total, item) => {
      return total + item.item.itemTotalPrice;
    }, 0);
  
    // Calculate the average price per group (excluding main)
    const groupKeys = Object.keys(items);
    const numberOfGroups = groupKeys.length - 1; // Exclude main
    const averageGroupPrice = totalGroup1Price / numberOfGroups;
  
    // Calculate the total price
    const totalPrice = averageGroupPrice + totalContainerPrice;
  
    console.log("items at Checkout: ", items);
    console.log("Total Price: ", totalPrice);
  }, [items]);

  const containerItems = useMemo(() => {
    return Object.keys(items).map((key) => (
      <Container key={key} containerId={key} items={items[key]} handleDelete={handleDelete} checkout={checkout} updateItems={setItems} whole_item_groups={items} />
    ));
  }, [items, handleDelete, checkout]);


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
      >
        {/* <div style={{width:"100%" ,overflowX:"auto", }}> */}
      {containerItems}
        {/* </div> */}
      </DndContext>
      
          {/* Add the Bootstrap button */}
    <Button variant="primary" onClick={addEmptyGroup}>
      <FontAwesomeIcon icon={faPlus} size="2x" />
    </Button>

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
        <div className="modal-body">
              {/* start of quantity (quantity = quantity text + buttons div) */}
                  <div className="quantity p-0"
                    style={{ marginRight: "0px", display: "flex", justifyContent: "space-between" }}>
                    <div>
                    <div>${quantity}</div>

                    </div>
                    {/* the add minus box set up */}
                    <div style={{ display: "flex" }}>

                      {/* the start of minus button set up */}
                      <div className="black_hover" style={{ padding: '4px', alignItems: 'center', justifyContent: 'center', display: "flex", borderLeft: "1px solid", borderTop: "1px solid", borderBottom: "1px solid", borderRadius: "12rem 0 0 12rem", height: "30px" }}>
                        <button className="minus-btn" type="button" name="button" style={{ margin: '0px', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', display: "flex" }}
                          onClick={() => {
                            console.log("delete 1 item")
                            handleMinusClick()
                          }}>
                          <MinusSvg style={{ margin: '0px', width: '10px', height: '10px' }} alt="" />
                        </button>
                      </div>
                      {/* the end of minus button set up */}

                      { /* start of the quantity number */}
                      <span
                      class="notranslate"
                        type="text"
                        style={{ width: '30px', height: '30px', fontSize: '17px', alignItems: 'center', justifyContent: 'center', borderTop: "1px solid", borderBottom: "1px solid", display: "flex", padding: '0px' }}
                      >{quantity}</span>
                      { /* end of the quantity number */}

                      { /* start of the add button */}
                      <div className="black_hover" style={{ padding: '4px', alignItems: 'center', justifyContent: 'center', display: "flex", borderRight: "1px solid", borderTop: "1px solid", borderBottom: "1px solid", borderRadius: "0 12rem 12rem 0", height: "30px" }}>
                        <button className="plus-btn" type="button" name="button" style={{ marginTop: '0px', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', display: "flex" }}
                          onClick={() => {
                            handlePlusClick()
                            // console.log("add 1 item")
                          }}>
                          <PlusSvg style={{ margin: '0px', width: '10px', height: '10px' }} alt="" />
                        </button>
                      </div>
                      { /* end of the add button */}
                    </div>
                    { /* end of the add minus setup*/}
                  </div>

                  {/* end of quantity */}
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleCloseModal()}
          >
            Cancel
          </button>
          {/* <button
            type="button"
            className="btn btn-primary"
            onClick={() => setTipsModalOpen(false)}
          >
            Add Tip
          </button> */}
        </div>
      </div>
    </div>
  </div>
)}

{/* <DragOverlay>{activeId ? <span id={activeId} dragOverlay /> : null}</DragOverlay> */}
{/* </DndContext> */}
  </div>
  );
}

export default Dnd_Test;