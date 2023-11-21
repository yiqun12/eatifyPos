import React from "react";
import { useDroppable } from "@dnd-kit/core";
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


function Item({ item, updateItems, whole_item_groups }) {

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
      <span>{item.name} x {item.quantity}</span>
      {generateAttributes(item.attributeSelected)}
      {/* <p className="font-bold text-2xl">{item.quantity}</p> */}
    </div>
  );
}


function SortableItem(props) {
  const { id, item, updateItems, whole_item_groups } = props;
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
      <Item id={id} item={item} updateItems={updateItems} whole_item_groups={whole_item_groups} />
    </div>
  );
}

function Container(props) {
  const { containerId, items, handleDelete, checkout, updateItems, whole_item_groups } = props;

  // console.log("container:", whole_item_groups)
  const { setNodeRef } = useDroppable({
    id: containerId
  });

  // console.log("container item: ", items)
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

            {/* Conditionally render the delete button */}
            {containerId !== "main" && (
              <Button variant="danger" style={{ marginTop: "auto" }} onClick={() => handleDelete(containerId)}>
                <FontAwesomeIcon icon={faTimesCircle} color="white" size="2x" />
              </Button>
            )}
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
                <SortableItem className="bordered" key={item.id} id={item.id} item={item.item} updateItems={updateItems} whole_item_groups={whole_item_groups} />
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

            <div className={`text-right`}>Subtotal: 123 </div>

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

