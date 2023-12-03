import {React, useState, useEffect} from "react";
import { useDroppable, DragOverlay } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import Button from 'react-bootstrap/Button';

import { ReactComponent as PlusSvg } from './plus.svg';
import { ReactComponent as MinusSvg } from './minus.svg';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';


// function Item({ heading, description }) 


function Item({ item, updateItems, whole_item_groups, numberOfGroups }) {

  function flattenAttributes(attributes) {
    function flattenObject(obj, prefix = "") {
      return Object.keys(obj).reduce((acc, key) => {
        const value = obj[key];
        const currentKey = prefix ? `${prefix} ${key}` : key;

        if (Array.isArray(value)) {
          // If the value is an array, join its elements and add to the result
          const flattenedArray = value.join(" ");
          return acc + currentKey + " " + flattenedArray + "<br />";
        } else if (typeof value === "object" && !Array.isArray(value)) {
          // If the value is an object, recursively flatten it
          return acc + flattenObject(value, currentKey);
        } else {
          // If the value is neither an object nor an array, add it to the result
          return acc + currentKey + " " + value + "<br />";
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
    <div className="w-full flex flex-col gap-4 rounded-md bg-white p-4 border-1 border-gray-800">
      {/* <p className="font-bold text-2xl">{heading}</p>
      <p className="text-gra7-700 font-thin">{description}</p> */}
      {/* <p className="font-bold text-2xl">{item.name}</p> */}
      <span>{item.name} x <b>{item.quantity} / {numberOfGroups}</b> </span>
      {generateAttributes(item.attributeSelected)}
      {/* <p className="font-bold text-2xl">{item.quantity}</p> */}
    </div>
  );
}


function SortableItem(props) {
  const { id, item, updateItems, whole_item_groups, numberOfGroups } = props;
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
      <Item id={id} item={item} updateItems={updateItems} whole_item_groups={whole_item_groups} numberOfGroups={numberOfGroups}/>
    </div>
  );
}

// Popup component
function ConfirmationPopup({ onConfirm, onCancel }) {
  return (
    <div className="popup">
      <p>Are you sure you want to delete?</p>
      <button onClick={onConfirm}>Confirm</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
}


function Container(props) {
  // containerId ** is the key of this specific group in the whole_item_groups
  // items ** has all the items in JSON object of the curent group
  // (no longer used) checkout ** is a function from dnd_test that calculates the total
  // (no longer used) updateItems ** is a function from dnd_test that allows you to change whole_item_groups
  // whole_item_groups ** is a JSON object consist of the whole dnd_test groups and its objects
  // number of Groups ** is the group divisor number for all the items (IE: food x 1 / 4 or pasta x 2 / 4)
  // dirty ** is a boolean indicator whether or not something has been changed such as an element has been dragged
  const { containerId, items, handleDelete, checkout, updateItems, whole_item_groups, numberOfGroups, dirty } = props;

  // console.log("container:", whole_item_groups)
  const { setNodeRef } = useDroppable({
    id: containerId
  });

  const [showPopup, setShowPopup] = useState(false);
  const [containerIdToDelete, setContainerIdToDelete] = useState(null);

  const openPopup = (containerId) => {

    if (containerId === "group0") {
      openGroup0DeleteModal()
      return
    }

    if (dirty === false) {
      handleDelete(containerId)
      return
    }

    // then if dirty is true, check if whole_item_groups[containerId] is non-empty, if so setShowPopup
    // check if the container is empty, if it is then call handleDelete directly
    if (whole_item_groups[containerId] && whole_item_groups[containerId].length > 0) {
      setShowPopup(true);
      setContainerIdToDelete(containerId);
    } else {
      handleDelete(containerId);
    }
    // setShowPopup(true);
    // setContainerIdToDelete(containerId);
  };

  const closePopup = () => {
    setShowPopup(false);
    setContainerIdToDelete(null);
  };

  const confirmDelete = () => {
    if (containerIdToDelete) {
      handleDelete(containerIdToDelete);
    }
    closePopup();
  };

  const [showGroup0DeleteModal, setShowGroup0DeleteModal] = useState(false);

  const openGroup0DeleteModal = () => {
    setShowGroup0DeleteModal(true)
  }

  const closeGroup0DeleteModal = () => {
    setShowGroup0DeleteModal(false)
  };

  // console.log("container item: ", items)

  // for totalPrice calculations (subtotal)
  const [subtotal, setSubtotal] = useState(0);
  console.log("Container ", containerId, " has items:", items)

  useEffect(() => {
    // Calculate the subtotal
    let newSubtotal = 0;
    items.forEach(({ item }) => {
      const pricePerGroup = parseFloat((item.itemTotalPrice / numberOfGroups).toFixed(2));
      newSubtotal += pricePerGroup;
    });
    setSubtotal(newSubtotal);
  }, [items, numberOfGroups]); // Dependency array includes 'items'

  return (

    <SortableContext
      id={containerId}
      items={items}
      strategy={verticalListSortingStrategy}
    >

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div className="text-center font-black text-gray-700 ml-1 mr-1">
          <div style={{ display: "flex", marginTop: "auto", justifyContent: "space-between" }}>
            {containerId !== "main" && (
              <Button variant="success" style={{ marginTop: "auto" }} onClick={() => checkout(containerId)}>
                <FontAwesomeIcon icon={faCheckCircle} color="white" size="2x" />
              </Button>
            )}
            {containerId}

              <Button variant="danger" style={{ marginTop: "auto" }} onClick={() => openPopup(containerId)}>
                <FontAwesomeIcon icon={faTimesCircle} color="white" size="2x" />
              </Button>

              {showPopup && (
            <div
              id="deletePopupModal"
              className="modal fade show"
              role="dialog"
              style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            >
              <div
                className="modal-dialog"
                role="document"
                style={{ 
                  maxWidth: '15%', 
                  width: '15%', 
                  margin: '0 auto', 
                  position: 'fixed',  // Use fixed positioning
                  top: '30%',         // Center vertically
                  left: '50%',        // Center horizontally
                  transform: 'translate(-50%, -50%)' // Adjust for the top-left origin
                }}>
                <div className="modal-content">
                  <div
                    className="modal-body"
                    style={{ overflowX: 'auto', maxWidth: '100%', paddingBottom: "0.5rem" }}
                  >
                    If this is deleted, all the items here will be placed in group 0
                  </div>
                  <div style={{display: "flex", justifyContent:"space-between"}}>
                    <button type="button" class="btn btn-secondary" onClick={closePopup} style={{margin:"5px"}}>Cancel</button>
                    <button type="button" class="btn btn-primary" onClickCapture={confirmDelete} style={{margin: "5px"}}>Confirm</button>
                  </div>
                </div>
              </div>
            </div>

          )}

{showGroup0DeleteModal && (
            <div
              id="deleteGroup0Modal"
              className="modal fade show"
              role="dialog"
              style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            >
              <div
                className="modal-dialog"
                role="document"
                style={{ 
                  maxWidth: '15%', 
                  width: '15%', 
                  margin: '0 auto', 
                  position: 'fixed',  // Use fixed positioning
                  top: '30%',         // Center vertically
                  left: '50%',        // Center horizontally
                  transform: 'translate(-50%, -50%)' // Adjust for the top-left origin
                }}>
                <div className="modal-content">
                  <div
                    className="modal-body"
                    style={{ overflowX: 'auto', maxWidth: '100%', paddingBottom: "0.5rem" }}
                  >
                    Group0 cannot be deleted
                  </div>
                  <div style={{display: "flex", justifyContent:"center"}}>
                  <button type="button" class="btn btn-primary" onClickCapture={closeGroup0DeleteModal} style={{margin: "5px"}}>Confirm</button>
                  </div>
                </div>
              </div>
            </div>

          )}


            {/* {showPopup && (
                  <ConfirmationPopup
                    onConfirm={confirmDelete}
                    onCancel={closePopup}
                  />
            )} */}
          </div>
        </div>

        <div className="flex ">

          <div className={`m-2`}>
            <div className="flex flex-col gap-4 p-4 min-w-[250px]" >
              {/* Add an invisible placeholder */}
              <div
                ref={setNodeRef}
                style={{ opacity: 0, height: 0, pointerEvents: 'none' }}
              ></div>
              {items.map((item) => (
                <SortableItem className="bordered" key={item.id} id={item.id} item={item.item} updateItems={updateItems} whole_item_groups={whole_item_groups} numberOfGroups={numberOfGroups}/>
              ))}
              {/* </div> */}

            </div>
          </div>
          <div className='flex flex-col space-y-2'>
            <a
              onClick={() => { }}
              className="mt-3 btn btn-sm btn-success mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              <span>{"Add Service Fee"}</span>
            </a>

            <a
              onClick={() => { }}
              className="mt-3 btn btn-sm btn-danger mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              <span>{"Add Discount"}</span>
            </a>

            <a
              onClick={() => { }}
              className="mt-3 btn btn-sm btn-secondary mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              <span>{"Merchant Receipt"}</span>
            </a>

            <a
              onClick={() => { }}
              className="mt-3 btn btn-sm btn-primary mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              <span>{"Card Pay"}</span>
            </a>

            <a
              onClick={() => { }}
              className="mt-3 btn btn-sm btn-info mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              <span>{"Cash Pay"}</span>
            </a>

            <div className={`text-right`}>Subtotal: ${subtotal} </div>

            <div className={`text-right `}>Discount: 321 </div>
            <div className={`text-right`}>Service Fee: 123 </div>
            <div className={`text-right `}>Gratuity: 321</div>
            <div className={`text-right `}>Tax(8.25%): 123    </div>
            <div className={`text-right `}>Total Amount: 321 </div>
          </div>
        </div>
      </div>





    </SortableContext>


  );
}

export default Container;

