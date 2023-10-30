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


function Item({item, updateItems, whole_item_groups}) {
  // console.log(whole_item_groups)
  // console.log("item inside of Item: ", item)

  // ** below is a representation of the object item ** //
  // {
  //   id: "b5fe9fb8-0f83-4b78-8ed5-c9cc3355aa76",
  //   name: "Filet Mignon",
  //   subtotal: 1,
  //   image:
  //     "https://img1.baidu.com/it/u=1363595818,3487481938&fm=253&fmt=auto&app=138&f=JPEG?w=891&h=500",
  //   quantity: 9,
  //   attributeSelected: {},
  //   count: "939065fe-16b4-441a-8465-b653ae1a0440",
  //   itemTotalPrice: 9,
  //   CHI: "菲力牛排",
  // },

  function flattenAttributes(attributes) {
    function flattenObject(obj, prefix = "") {
      return Object.keys(obj).reduce((acc, key) => {
        const value = obj[key];
        const currentKey = prefix ? `${prefix} ${key}` : key;
  
        if (Array.isArray(value)) {
          // If the value is an array, join its elements and add to the result
          const flattenedArray = value.join(" ");
          return acc + currentKey + " " + flattenedArray + " ";
        } else if (typeof value === "object" && !Array.isArray(value)) {
          // If the value is an object, recursively flatten it
          return acc + flattenObject(value, currentKey);
        } else {
          // If the value is neither an object nor an array, add it to the result
          return acc + currentKey + " " + value + " ";
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
        <div dangerouslySetInnerHTML={{ __html: attributeString }} style={{ fontSize: '14px' }} />
      );
    }
  }

  return (
    <div className="w-full flex flex-col gap-4 rounded-md bg-white p-4 shadow-md">
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
  const { containerId, items, handleDelete, checkout, updateItems, whole_item_groups, totalAmount } = props;

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
      <div className={`flex flex-col gap-4 p-4 ${containerId !== "main" ? "bg-gray-200" : "bg-green-200"}`} style={{ width: "22.5%", minWidth: "22.5%", maxWidth: "22.5%" }}>
        {/* <div style={{ maxHeight: "400px", overflowY: "auto", overflowX:"hidden" }}> */}
        <div style={{    display: "flex", flexDirection: "column"}}>
            <h1 className="text-center font-black text-4xl text-gray-700">
              {containerId}
            </h1>
            {containerId !== "main" && (
              <div style={{textAlign:"center", marginTop:"10px"}}>total: ${totalAmount(containerId)}</div>
            )}
        </div>

        {/* Add an invisible placeholder */}
        <div
          ref={setNodeRef}
          style={{ opacity: 0, height: 0, pointerEvents: 'none' }}
        ></div>
        {items.map((item) => (
          <SortableItem key={item.id} id={item.id} item={item.item} updateItems={updateItems} whole_item_groups={whole_item_groups}  />
        ))}
        {/* </div> */}
        
        <div style={{display:"flex", marginTop:"auto", justifyContent: "space-between"}}>
        {containerId !== "main" && (
          <Button variant="success" style={{ marginTop: "auto", width: "40%" }} onClick={() => checkout(containerId)}>
            <FontAwesomeIcon icon={faCheckCircle} color="white" size="2x" />
          </Button>
        )}

        {/* Conditionally render the delete button */}
        {containerId !== "main" && (
          <Button variant="danger" style={{ marginTop: "auto", width: "40%" }} onClick={() => handleDelete(containerId)}>
            <FontAwesomeIcon icon={faTimesCircle} color="white" size="2x" />
          </Button>
        )}
        </div>

      </div>
    </SortableContext>
  );
}

export default Container;


  //  {/* <p className="text-gra7-700 font-thin">{item.quantity}</p> */}

                  //       {/* start of quantity (quantity = quantity text + buttons div) */}
                  //       <div className="quantity p-0"
                  //   style={{ marginRight: "0px", display: "flex", justifyContent: "space-between" }}>
                  //   <div>
                  //   <div>${10}</div>

                  //   </div>
                  //   {/* the add minus box set up */}
                  //   <div style={{ display: "flex" }}>

                  //     {/* the start of minus button set up */}
                  //     <div className="black_hover" style={{ padding: '4px', alignItems: 'center', justifyContent: 'center', display: "flex", borderLeft: "1px solid", borderTop: "1px solid", borderBottom: "1px solid", borderRadius: "12rem 0 0 12rem", height: "30px" }}>
                  //       <button className="minus-btn" type="button" name="button" style={{ margin: '0px', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', display: "flex" }}
                  //         onClick={() => {
                  //           // if (product.quantity === 1) {
                  //           if (item.quantity === 1) {
                  //             // handleDeleteClick(product.id,product.count);
                  //             console.log("delete 0 item")
                  //           } else {
                  //             console.log("delete 1 item")
                  //             // handleMinusClick(product.id,product.count)
                  //             //handleMinusClick(product.id);
                  //           }
                  //         }}>
                  //         <MinusSvg style={{ margin: '0px', width: '10px', height: '10px' }} alt="" />
                  //       </button>
                  //     </div>
                  //     {/* the end of minus button set up */}

                  //     { /* start of the quantity number */}
                  //     <span
                  //     class="notranslate"
                  //       type="text"
                  //       style={{ width: '30px', height: '30px', fontSize: '17px', alignItems: 'center', justifyContent: 'center', borderTop: "1px solid", borderBottom: "1px solid", display: "flex", padding: '0px' }}
                  //     >{10}</span>
                  //     { /* end of the quantity number */}

                  //     { /* start of the add button */}
                  //     <div className="black_hover" style={{ padding: '4px', alignItems: 'center', justifyContent: 'center', display: "flex", borderRight: "1px solid", borderTop: "1px solid", borderBottom: "1px solid", borderRadius: "0 12rem 12rem 0", height: "30px" }}>
                  //       <button className="plus-btn" type="button" name="button" style={{ marginTop: '0px', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', display: "flex" }}
                  //         onClick={() => {
                  //           // handlePlusClick(product.id,product.count)
                  //           console.log("add 1 item")
                  //         }}>
                  //         <PlusSvg style={{ margin: '0px', width: '10px', height: '10px' }} alt="" />
                  //       </button>
                  //     </div>
                  //     { /* end of the add button */}
                  //   </div>
                  //   { /* end of the add minus setup*/}
                  // </div>

                  // {/* end of quantity */}