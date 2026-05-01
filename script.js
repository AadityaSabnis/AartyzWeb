/* Aartyz Theme JS */
/**
 * Aartyz — Frontend Script (Static / Vercel Edition)
 * ====================================================
 * Zero backend dependency. All 94 products are embedded below.
 * Filtering, sorting, searching and rendering all run in-memory.
 * Drop index.html + style.css + script.js into any static host — done.
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
//  PRODUCT CATALOGUE  (94 products, mirrors app.py exactly)
// ─────────────────────────────────────────────────────────────────────────────
const PRODUCTS = [
  // ── WOMEN › SAREES ────────────────────────────────────────────────────────
  {id:"W001",name:"Aartyz Indigo Floral Silk Saree",         category:"women",subcategory:"sarees",         gender:"women",fabric:"silk",    color:"indigo",  size:[],                         price:3800,originalPrice:3800,sale:false,stock:8, featured:true, newArrival:true, popular:true,  image:"https://aartyz.in/wp-content/uploads/2025/07/Gemini_Generated_Image_oz7e9coz7e9coz7e-e1768591810204.png",tags:["floral","silk","festive","wedding"]},
  {id:"W002",name:"Aartyz Rust Kalamkari Cotton Saree",      category:"women",subcategory:"sarees",         gender:"women",fabric:"cotton",  color:"rust",    size:[],                         price:2400,originalPrice:2400,sale:false,stock:12,featured:false,newArrival:false,popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/01/Gemini_Generated_Image_85n6l85n6l85n6l8-e1772431970271.png",tags:["kalamkari","cotton","casual"]},
  {id:"W003",name:"Aartyz Saffron Chanderi Block Saree",     category:"women",subcategory:"sarees",         gender:"women",fabric:"chanderi",color:"saffron", size:[],                         price:3360,originalPrice:4200,sale:true, stock:5, featured:true, newArrival:false,popular:true,  image:"https://aartyz.in/wp-content/uploads/2023/05/11-768x768-1.png",tags:["chanderi","festive","sale"]},
  {id:"W004",name:"Aartyz Paisley Khadi Saree",              category:"women",subcategory:"sarees",         gender:"women",fabric:"khadi",   color:"navy",    size:[],                         price:2850,originalPrice:2850,sale:false,stock:7, featured:false,newArrival:true, popular:false, image:"https://aartyz.in/wp-content/uploads/2025/07/Gemini_Generated_Image_oz7e9coz7e9coz7e-e1768591810204.png",tags:["paisley","khadi"]},
  {id:"W005",name:"Aartyz Teal Geometric Silk Saree",        category:"women",subcategory:"sarees",         gender:"women",fabric:"silk",    color:"teal",    size:[],                         price:4500,originalPrice:4500,sale:false,stock:4, featured:true, newArrival:false,popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/01/Gemini_Generated_Image_85n6l85n6l85n6l8-e1772431970271.png",tags:["geometric","silk","wedding"]},
  {id:"W006",name:"Aartyz Mustard Floral Cotton Saree",      category:"women",subcategory:"sarees",         gender:"women",fabric:"cotton",  color:"mustard", size:[],                         price:1950,originalPrice:1950,sale:false,stock:15,featured:false,newArrival:false,popular:false, image:"https://aartyz.in/wp-content/uploads/2023/05/11-768x768-1.png",tags:["floral","cotton","casual"]},
  {id:"W007",name:"Aartyz Rose Pink Chanderi Saree",         category:"women",subcategory:"sarees",         gender:"women",fabric:"chanderi",color:"pink",    size:[],                         price:3400,originalPrice:3400,sale:false,stock:6, featured:false,newArrival:true, popular:false, image:"https://aartyz.in/wp-content/uploads/2025/07/Gemini_Generated_Image_oz7e9coz7e9coz7e-e1768591810204.png",tags:["chanderi","festive"]},
  {id:"W008",name:"Aartyz Navy Buta Print Saree",            category:"women",subcategory:"sarees",         gender:"women",fabric:"cotton",  color:"navy",    size:[],                         price:2400,originalPrice:3000,sale:true, stock:9, featured:false,newArrival:false,popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/01/Gemini_Generated_Image_85n6l85n6l85n6l8-e1772431970271.png",tags:["buta","cotton","sale"]},
  // ── WOMEN › KURTIS ────────────────────────────────────────────────────────
  {id:"W010",name:"Aartyz Front Cut Kurti",                  category:"women",subcategory:"kurtis",         gender:"women",fabric:"cotton",  color:"multicolor",size:["XS","S","M","L","XL","XXL"],price:750, originalPrice:1100,sale:true, stock:30,featured:true, newArrival:false,popular:true,  image:"https://aartyz.in/wp-content/uploads/2023/05/36-768x768-1.jpg",tags:["kurti","cotton","sale","budget"]},
  {id:"W011",name:"Aartyz Maroon Floral Chanderi Kurti",     category:"women",subcategory:"kurtis",         gender:"women",fabric:"chanderi",color:"maroon",  size:["XS","S","M","L","XL","XXL"],price:2550,originalPrice:2550,sale:false,stock:10,featured:true, newArrival:true, popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/04/1.png",tags:["kurti","chanderi","festive","floral"]},
  {id:"W012",name:"Aartyz Green Khadi Tulip Kurti",          category:"women",subcategory:"kurtis",         gender:"women",fabric:"khadi",   color:"green",   size:["XS","S","M","L","XL","XXL"],price:1650,originalPrice:1650,sale:false,stock:14,featured:false,newArrival:true, popular:false, image:"https://aartyz.in/wp-content/uploads/2023/05/36-768x768-1.jpg",tags:["kurti","khadi","casual"]},
  {id:"W013",name:"Aartyz Yellow Floral Dress Material",     category:"women",subcategory:"kurtis",         gender:"women",fabric:"chanderi",color:"yellow",  size:["XS","S","M","L","XL","XXL"],price:2550,originalPrice:2550,sale:false,stock:8, featured:false,newArrival:true, popular:false, image:"https://aartyz.in/wp-content/uploads/2026/04/1.png",tags:["kurti","chanderi","floral"]},
  {id:"W014",name:"Aartyz Pastel Pink Floral Kurti",         category:"women",subcategory:"kurtis",         gender:"women",fabric:"chanderi",color:"pink",    size:["XS","S","M","L","XL","XXL"],price:2550,originalPrice:2550,sale:false,stock:7, featured:true, newArrival:true, popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/04/1.png",tags:["kurti","chanderi","festive"]},
  {id:"W015",name:"Aartyz Allover Print Cotton Kurti",       category:"women",subcategory:"kurtis",         gender:"women",fabric:"cotton",  color:"multicolor",size:["XS","S","M","L","XL","XXL"],price:2050,originalPrice:2050,sale:false,stock:11,featured:false,newArrival:true, popular:false, image:"https://aartyz.in/wp-content/uploads/2026/04/1.png",tags:["kurti","cotton","casual"]},
  {id:"W016",name:"Aartyz Grey Chanderi Long Kurti",         category:"women",subcategory:"kurtis",         gender:"women",fabric:"chanderi",color:"grey",    size:["XS","S","M","L","XL","XXL"],price:2050,originalPrice:2050,sale:false,stock:6, featured:false,newArrival:true, popular:false, image:"https://aartyz.in/wp-content/uploads/2026/04/1.png",tags:["kurti","chanderi","office"]},
  // ── WOMEN › DRESS MATERIAL ────────────────────────────────────────────────
  {id:"W020",name:"Aartyz Maroon Floral Print Dress Material",category:"women",subcategory:"dress_material",gender:"women",fabric:"chanderi",color:"maroon",  size:[],                         price:2550,originalPrice:2550,sale:false,stock:14,featured:true, newArrival:true, popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/04/1.png",tags:["dress material","chanderi","floral"]},
  {id:"W021",name:"Aartyz Green Khadi Tulip Dress Material", category:"women",subcategory:"dress_material",gender:"women",fabric:"khadi",   color:"green",   size:[],                         price:1650,originalPrice:1650,sale:false,stock:10,featured:false,newArrival:true, popular:false, image:"https://aartyz.in/wp-content/uploads/2023/05/36-768x768-1.jpg",tags:["dress material","khadi"]},
  {id:"W022",name:"Aartyz Yellow Floral Dress Material",     category:"women",subcategory:"dress_material",gender:"women",fabric:"chanderi",color:"yellow",  size:[],                         price:2550,originalPrice:2550,sale:false,stock:9, featured:false,newArrival:true, popular:false, image:"https://aartyz.in/wp-content/uploads/2026/04/1.png",tags:["dress material","chanderi","floral"]},
  {id:"W023",name:"Aartyz Allover Print Dress Material",     category:"women",subcategory:"dress_material",gender:"women",fabric:"chanderi",color:"multicolor",size:[],                        price:2550,originalPrice:2550,sale:false,stock:8, featured:false,newArrival:true, popular:false, image:"https://aartyz.in/wp-content/uploads/2026/04/1.png",tags:["dress material","chanderi"]},
  {id:"W024",name:"Aartyz Pastel Pink Floral Dress Material",category:"women",subcategory:"dress_material",gender:"women",fabric:"chanderi",color:"pink",    size:[],                         price:2550,originalPrice:2550,sale:false,stock:7, featured:false,newArrival:true, popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/04/1.png",tags:["dress material","chanderi","festive"]},
  {id:"W025",name:"Aartyz Grey Chanderi Dress Material",     category:"women",subcategory:"dress_material",gender:"women",fabric:"chanderi",color:"grey",    size:[],                         price:2050,originalPrice:2050,sale:false,stock:12,featured:false,newArrival:true, popular:false, image:"https://aartyz.in/wp-content/uploads/2026/04/1.png",tags:["dress material","chanderi"]},
  // ── WOMEN › DUPATTA ───────────────────────────────────────────────────────
  {id:"W030",name:"Aartyz Kalamkari Silk Dupatta",           category:"women",subcategory:"dupatta",        gender:"women",fabric:"silk",    color:"rust",    size:[],                         price:550, originalPrice:550, sale:false,stock:25,featured:true, newArrival:true, popular:true,  image:"https://aartyz.in/wp-content/uploads/2023/05/11-768x768-1.png",tags:["dupatta","silk","kalamkari"]},
  {id:"W031",name:"Aartyz Indigo Block Cotton Dupatta",      category:"women",subcategory:"dupatta",        gender:"women",fabric:"cotton",  color:"indigo",  size:[],                         price:480, originalPrice:480, sale:false,stock:30,featured:false,newArrival:false,popular:true,  image:"https://aartyz.in/wp-content/uploads/2025/07/Gemini_Generated_Image_oz7e9coz7e9coz7e-e1768591810204.png",tags:["dupatta","cotton","casual"]},
  {id:"W032",name:"Aartyz Teal Jute Silk Dupatta",           category:"women",subcategory:"dupatta",        gender:"women",fabric:"jute silk",color:"teal",   size:[],                         price:720, originalPrice:900, sale:true, stock:15,featured:false,newArrival:false,popular:false, image:"https://aartyz.in/wp-content/uploads/2023/05/11-768x768-1.png",tags:["dupatta","jute silk","sale"]},
  {id:"W033",name:"Aartyz Mustard Chanderi Dupatta",         category:"women",subcategory:"dupatta",        gender:"women",fabric:"chanderi",color:"mustard", size:[],                         price:750, originalPrice:750, sale:false,stock:18,featured:false,newArrival:true, popular:false, image:"https://aartyz.in/wp-content/uploads/2025/07/Gemini_Generated_Image_oz7e9coz7e9coz7e-e1768591810204.png",tags:["dupatta","chanderi"]},
  // ── WOMEN › TOPS & SHIRTS ─────────────────────────────────────────────────
  {id:"W040",name:"Aartyz Floral Block Print Shirt",         category:"women",subcategory:"tops_shirts",   gender:"women",fabric:"cotton",  color:"multicolor",size:["XS","S","M","L","XL","XXL"],price:1200,originalPrice:1200,sale:false,stock:20,featured:false,newArrival:true, popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/03/ChatGPT-Image-Mar-23-2026-11_12_52-AM-1300x867.png",tags:["shirt","cotton","casual"]},
  {id:"W041",name:"Aartyz Indigo Crop Top",                  category:"women",subcategory:"tops_shirts",   gender:"women",fabric:"cotton",  color:"indigo",  size:["XS","S","M","L","XL"],      price:850, originalPrice:850, sale:false,stock:22,featured:false,newArrival:false,popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/01/Gemini_Generated_Image_85n6l85n6l85n6l8-e1772431970271.png",tags:["crop top","cotton","casual"]},
  {id:"W042",name:"Aartyz Rust Kalamkari Tunic",             category:"women",subcategory:"tops_shirts",   gender:"women",fabric:"khadi",   color:"rust",    size:["XS","S","M","L","XL","XXL"],price:1280,originalPrice:1600,sale:true, stock:12,featured:false,newArrival:false,popular:false, image:"https://aartyz.in/wp-content/uploads/2025/07/Gemini_Generated_Image_oz7e9coz7e9coz7e-e1768591810204.png",tags:["tunic","khadi","kalamkari","sale"]},
  {id:"W043",name:"Aartyz Teal Geometric Shirt",             category:"women",subcategory:"tops_shirts",   gender:"women",fabric:"cotton",  color:"teal",    size:["XS","S","M","L","XL","XXL"],price:1350,originalPrice:1350,sale:false,stock:16,featured:false,newArrival:true, popular:false, image:"https://aartyz.in/wp-content/uploads/2026/03/ChatGPT-Image-Mar-23-2026-11_12_52-AM-1300x867.png",tags:["shirt","cotton","geometric"]},
  // ── WOMEN › CO-ORD SETS ───────────────────────────────────────────────────
  {id:"W050",name:"Aartyz Floral Summer Co-ord Set",         category:"women",subcategory:"coords",        gender:"women",fabric:"cotton",  color:"multicolor",size:["XS","S","M","L","XL","XXL"],price:2800,originalPrice:2800,sale:false,stock:10,featured:true, newArrival:true, popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/01/Gemini_Generated_Image_85n6l85n6l85n6l8-e1772431970271.png",tags:["co-ord","cotton","summer","casual"]},
  {id:"W051",name:"Aartyz Indigo Chanderi Co-ord",           category:"women",subcategory:"coords",        gender:"women",fabric:"chanderi",color:"indigo",  size:["XS","S","M","L","XL","XXL"],price:3600,originalPrice:3600,sale:false,stock:7, featured:true, newArrival:false,popular:true,  image:"https://aartyz.in/wp-content/uploads/2025/07/Gemini_Generated_Image_oz7e9coz7e9coz7e-e1768591810204.png",tags:["co-ord","chanderi","festive"]},
  {id:"W052",name:"Aartyz Rust Geometric Co-ord Set",        category:"women",subcategory:"coords",        gender:"women",fabric:"khadi",   color:"rust",    size:["XS","S","M","L","XL","XXL"],price:2560,originalPrice:3200,sale:true, stock:8, featured:false,newArrival:false,popular:false, image:"https://aartyz.in/wp-content/uploads/2026/03/ChatGPT-Image-Mar-23-2026-11_12_52-AM-1300x867.png",tags:["co-ord","khadi","geometric","sale"]},
  // ── WOMEN › ONE PIECE DRESS ───────────────────────────────────────────────
  {id:"W060",name:"Aartyz Indigo Floral Midi Dress",         category:"women",subcategory:"one_piece_dress",gender:"women",fabric:"cotton", color:"indigo",  size:["XS","S","M","L","XL","XXL"],price:2200,originalPrice:2200,sale:false,stock:12,featured:false,newArrival:true, popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/01/Gemini_Generated_Image_85n6l85n6l85n6l8-e1772431970271.png",tags:["dress","midi","cotton","casual"]},
  {id:"W061",name:"Aartyz Saffron Chanderi Maxi Dress",      category:"women",subcategory:"one_piece_dress",gender:"women",fabric:"chanderi",color:"saffron",size:["XS","S","M","L","XL","XXL"],price:3100,originalPrice:3100,sale:false,stock:6, featured:true, newArrival:false,popular:true,  image:"https://aartyz.in/wp-content/uploads/2025/07/Gemini_Generated_Image_oz7e9coz7e9coz7e-e1768591810204.png",tags:["dress","maxi","chanderi","festive"]},
  {id:"W062",name:"Aartyz Rust Buta Midi Dress",             category:"women",subcategory:"one_piece_dress",gender:"women",fabric:"cotton", color:"rust",    size:["XS","S","M","L","XL","XXL"],price:1920,originalPrice:2400,sale:true, stock:9, featured:false,newArrival:false,popular:false, image:"https://aartyz.in/wp-content/uploads/2026/03/ChatGPT-Image-Mar-23-2026-11_12_52-AM-1300x867.png",tags:["dress","midi","cotton","sale"]},
  // ── WOMEN › PALAZZO & LOWERS ──────────────────────────────────────────────
  {id:"W070",name:"Aartyz Indigo Wide Leg Palazzo",          category:"women",subcategory:"palazzo_lowers", gender:"women",fabric:"cotton",  color:"indigo",  size:["XS","S","M","L","XL","XXL"],price:1100,originalPrice:1100,sale:false,stock:18,featured:false,newArrival:true, popular:false, image:"https://aartyz.in/wp-content/uploads/2026/01/Gemini_Generated_Image_85n6l85n6l85n6l8-e1772431970271.png",tags:["palazzo","cotton","casual"]},
  {id:"W071",name:"Aartyz Rust Floral Chanderi Palazzo",     category:"women",subcategory:"palazzo_lowers", gender:"women",fabric:"chanderi",color:"rust",    size:["XS","S","M","L","XL","XXL"],price:1400,originalPrice:1400,sale:false,stock:12,featured:false,newArrival:false,popular:false, image:"https://aartyz.in/wp-content/uploads/2025/07/Gemini_Generated_Image_oz7e9coz7e9coz7e-e1768591810204.png",tags:["palazzo","chanderi","festive"]},
  {id:"W072",name:"Aartyz Teal Geometric Palazzo",           category:"women",subcategory:"palazzo_lowers", gender:"women",fabric:"cotton",  color:"teal",    size:["XS","S","M","L","XL","XXL"],price:960, originalPrice:1200,sale:true, stock:14,featured:false,newArrival:false,popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/03/ChatGPT-Image-Mar-23-2026-11_12_52-AM-1300x867.png",tags:["palazzo","cotton","geometric","sale"]},
  // ── WOMEN › COTTON SKIRTS & WRAP AROUNDS ─────────────────────────────────
  {id:"W080",name:"Aartyz Floral A-Line Midi Skirt",         category:"women",subcategory:"cotton_skirts",  gender:"women",fabric:"cotton",  color:"multicolor",size:["XS","S","M","L","XL","XXL"],price:1100,originalPrice:1100,sale:false,stock:15,featured:false,newArrival:true, popular:false, image:"https://aartyz.in/wp-content/uploads/2026/01/Gemini_Generated_Image_85n6l85n6l85n6l8-e1772431970271.png",tags:["skirt","a-line","cotton","casual"]},
  {id:"W081",name:"Aartyz Indigo Tiered Maxi Skirt",         category:"women",subcategory:"cotton_skirts",  gender:"women",fabric:"cotton",  color:"indigo",  size:["XS","S","M","L","XL","XXL"],price:1600,originalPrice:1600,sale:false,stock:10,featured:false,newArrival:false,popular:true,  image:"https://aartyz.in/wp-content/uploads/2025/07/Gemini_Generated_Image_oz7e9coz7e9coz7e-e1768591810204.png",tags:["skirt","tiered","maxi","cotton"]},
  {id:"W082",name:"Aartyz Rust Kalamkari Wrap Skirt",        category:"women",subcategory:"cotton_skirts",  gender:"women",fabric:"cotton",  color:"rust",    size:["XS","S","M","L","XL","XXL"],price:1440,originalPrice:1800,sale:true, stock:8, featured:false,newArrival:false,popular:false, image:"https://aartyz.in/wp-content/uploads/2026/03/ChatGPT-Image-Mar-23-2026-11_12_52-AM-1300x867.png",tags:["skirt","wrap around","kalamkari","sale"]},
  // ── WOMEN › DESIGNER BLOUSE ───────────────────────────────────────────────
  {id:"W090",name:"Aartyz Kalamkari Silk Blouse Piece",      category:"women",subcategory:"blouse",         gender:"women",fabric:"silk",    color:"multicolor",size:[],                        price:850, originalPrice:850, sale:false,stock:10,featured:false,newArrival:true, popular:true,  image:"https://aartyz.in/wp-content/uploads/2023/05/11-768x768-1.png",tags:["blouse","silk","kalamkari"]},
  {id:"W091",name:"Aartyz Floral Chanderi Blouse Piece",     category:"women",subcategory:"blouse",         gender:"women",fabric:"chanderi",color:"multicolor",size:[],                        price:650, originalPrice:650, sale:false,stock:12,featured:false,newArrival:false,popular:false, image:"https://aartyz.in/wp-content/uploads/2025/07/Gemini_Generated_Image_oz7e9coz7e9coz7e-e1768591810204.png",tags:["blouse","chanderi","floral"]},
  {id:"W092",name:"Aartyz Gold Brocade Blouse Piece",        category:"women",subcategory:"blouse",         gender:"women",fabric:"brocade", color:"gold",    size:[],                         price:1120,originalPrice:1400,sale:true, stock:5, featured:true, newArrival:false,popular:true,  image:"https://aartyz.in/wp-content/uploads/2023/05/11-768x768-1.png",tags:["blouse","brocade","wedding","sale"]},
  // ── MEN › SHIRTS ──────────────────────────────────────────────────────────
  {id:"M001",name:"Aartyz Maroon Block Print Shirt",         category:"men",  subcategory:"shirts",         gender:"men",  fabric:"cotton",  color:"maroon",  size:["36","38","40","42","44","46"],price:1650,originalPrice:1650,sale:false,stock:20,featured:true, newArrival:false,popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/03/ChatGPT-Image-Mar-22-2026-04_14_30-PM.png",tags:["shirt","block print","cotton","casual"]},
  {id:"M002",name:"Aartyz White Ikat Shirt",                 category:"men",  subcategory:"shirts",         gender:"men",  fabric:"cotton",  color:"white",   size:["36","38","40","42","44","46"],price:1250,originalPrice:1250,sale:false,stock:25,featured:true, newArrival:false,popular:true,  image:"https://aartyz.in/wp-content/uploads/2025/11/1.jpg",tags:["shirt","ikat","cotton","casual"]},
  {id:"M003",name:"Aartyz Quirky Print Shirt",               category:"men",  subcategory:"shirts",         gender:"men",  fabric:"khadi",   color:"multicolor",size:["36","38","40","42","44","46"],price:1250,originalPrice:1250,sale:false,stock:18,featured:false,newArrival:false,popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/03/ChatGPT-Image-Mar-22-2026-04_14_30-PM.png",tags:["shirt","quirky","khadi","casual"]},
  {id:"M004",name:"Aartyz Kalamkari Paisley Print Shirt",    category:"men",  subcategory:"shirts",         gender:"men",  fabric:"cotton",  color:"multicolor",size:["36","38","40","42","44","46"],price:1299,originalPrice:1299,sale:false,stock:14,featured:true, newArrival:true, popular:true,  image:"https://aartyz.in/wp-content/uploads/2025/11/1.jpg",tags:["shirt","kalamkari","paisley","cotton"]},
  {id:"M005",name:"Aartyz Olive Green Ikat Slim Fit Shirt",  category:"men",  subcategory:"shirts",         gender:"men",  fabric:"cotton",  color:"green",   size:["36","38","40","42","44","46"],price:1250,originalPrice:1250,sale:false,stock:16,featured:false,newArrival:false,popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/03/ChatGPT-Image-Mar-22-2026-04_14_30-PM.png",tags:["shirt","ikat","slim fit","cotton"]},
  {id:"M006",name:"Aartyz Rust Paisley Linen Shirt",         category:"men",  subcategory:"shirts",         gender:"men",  fabric:"linen",   color:"rust",    size:["36","38","40","42","44","46"],price:1760,originalPrice:2200,sale:true, stock:10,featured:false,newArrival:false,popular:false, image:"https://aartyz.in/wp-content/uploads/2025/11/1.jpg",tags:["shirt","linen","paisley","sale"]},
  {id:"M007",name:"Aartyz Teal Geometric Block Shirt",       category:"men",  subcategory:"shirts",         gender:"men",  fabric:"cotton",  color:"teal",    size:["36","38","40","42","44","46"],price:1650,originalPrice:1650,sale:false,stock:12,featured:false,newArrival:true, popular:false, image:"https://aartyz.in/wp-content/uploads/2026/03/ChatGPT-Image-Mar-22-2026-04_14_30-PM.png",tags:["shirt","block print","geometric","cotton"]},
  {id:"M008",name:"Aartyz Indigo Floral Block Shirt",        category:"men",  subcategory:"block_print_shirts",gender:"men",fabric:"khadi",  color:"indigo",  size:["36","38","40","42","44","46"],price:1450,originalPrice:1450,sale:false,stock:14,featured:false,newArrival:false,popular:false, image:"https://aartyz.in/wp-content/uploads/2025/11/1.jpg",tags:["shirt","block print","khadi"]},
  {id:"M009",name:"Aartyz Mustard Buta Khadi Block Shirt",   category:"men",  subcategory:"block_print_shirts",gender:"men",fabric:"khadi",  color:"mustard", size:["36","38","40","42","44","46"],price:1450,originalPrice:1450,sale:false,stock:11,featured:false,newArrival:true, popular:false, image:"https://aartyz.in/wp-content/uploads/2026/03/ChatGPT-Image-Mar-22-2026-04_14_30-PM.png",tags:["shirt","block print","khadi","buta"]},
  {id:"M010",name:"Aartyz Kalamkari Floral Cotton Shirt",    category:"men",  subcategory:"kalamkari_shirts",gender:"men",  fabric:"cotton",  color:"multicolor",size:["36","38","40","42","44","46"],price:1450,originalPrice:1450,sale:false,stock:9, featured:false,newArrival:false,popular:true,  image:"https://aartyz.in/wp-content/uploads/2025/11/1.jpg",tags:["shirt","kalamkari","floral","cotton"]},
  {id:"M011",name:"Aartyz Kalamkari Geometric Shirt",        category:"men",  subcategory:"kalamkari_shirts",gender:"men",  fabric:"cotton",  color:"multicolor",size:["36","38","40","42","44","46"],price:1320,originalPrice:1650,sale:true, stock:7, featured:false,newArrival:false,popular:false, image:"https://aartyz.in/wp-content/uploads/2026/03/ChatGPT-Image-Mar-22-2026-04_14_30-PM.png",tags:["shirt","kalamkari","geometric","sale"]},
  // ── MEN › ETHNIC BLAZERS ──────────────────────────────────────────────────
  {id:"M020",name:"Aartyz Indigo Block Print Ethnic Blazer", category:"men",  subcategory:"ethnic_blazers",  gender:"men",  fabric:"chanderi",color:"indigo",  size:["36","38","40","42","44","46"],price:4200,originalPrice:4200,sale:false,stock:5, featured:true, newArrival:true, popular:true,  image:"https://aartyz.in/wp-content/uploads/2025/11/1.jpg",tags:["blazer","ethnic","chanderi","festive"]},
  {id:"M021",name:"Aartyz Rust Kalamkari Silk Blazer",       category:"men",  subcategory:"ethnic_blazers",  gender:"men",  fabric:"silk",    color:"rust",    size:["36","38","40","42","44","46"],price:5200,originalPrice:5200,sale:false,stock:3, featured:true, newArrival:false,popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/03/ChatGPT-Image-Mar-22-2026-04_14_30-PM.png",tags:["blazer","ethnic","silk","wedding"]},
  {id:"M022",name:"Aartyz Teal Block Print Ethnic Blazer",   category:"men",  subcategory:"ethnic_blazers",  gender:"men",  fabric:"chanderi",color:"teal",    size:["36","38","40","42","44","46"],price:4600,originalPrice:4600,sale:false,stock:4, featured:false,newArrival:true, popular:false, image:"https://aartyz.in/wp-content/uploads/2025/11/1.jpg",tags:["blazer","ethnic","chanderi","festive"]},
  // ── MEN › MODI JACKETS ────────────────────────────────────────────────────
  {id:"M030",name:"Aartyz Block Print Modi Jacket",          category:"men",  subcategory:"modi_jackets",    gender:"men",  fabric:"khadi",   color:"multicolor",size:["36","38","40","42","44","46"],price:2800,originalPrice:2800,sale:false,stock:10,featured:true, newArrival:true, popular:true,  image:"https://aartyz.in/wp-content/uploads/2025/11/1.jpg",tags:["modi jacket","khadi","festive"]},
  {id:"M031",name:"Aartyz Kalamkari Nehru Vest Coat",        category:"men",  subcategory:"modi_jackets",    gender:"men",  fabric:"silk",    color:"multicolor",size:["36","38","40","42","44","46"],price:2560,originalPrice:3200,sale:true, stock:8, featured:true, newArrival:false,popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/03/ChatGPT-Image-Mar-22-2026-04_14_30-PM.png",tags:["nehru vest","silk","kalamkari","sale"]},
  {id:"M032",name:"Aartyz Indigo Block Waistcoat",           category:"men",  subcategory:"modi_jackets",    gender:"men",  fabric:"cotton",  color:"indigo",  size:["36","38","40","42","44","46"],price:1800,originalPrice:1800,sale:false,stock:12,featured:false,newArrival:false,popular:false, image:"https://aartyz.in/wp-content/uploads/2025/11/1.jpg",tags:["waistcoat","cotton","casual"]},
  {id:"M033",name:"Aartyz Festival Silk Modi Jacket",        category:"men",  subcategory:"modi_jackets",    gender:"men",  fabric:"silk",    color:"multicolor",size:["36","38","40","42","44","46"],price:3600,originalPrice:3600,sale:false,stock:6, featured:true, newArrival:true, popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/03/ChatGPT-Image-Mar-22-2026-04_14_30-PM.png",tags:["modi jacket","silk","festive","wedding"]},
  // ── HOME DECOR › BEDSHEETS ────────────────────────────────────────────────
  {id:"H001",name:"Aartyz Timeless Artistry Sanctuary Bedsheet",category:"home_decor",subcategory:"bedsheets",gender:null,fabric:"cotton",color:"multicolor",size:["King"],   price:2850,originalPrice:2850,sale:false,stock:15,featured:true, newArrival:true, popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/03/Gemini_Generated_Image_xbehgsxbehgsxbeh-e1772440516640.png",tags:["bedsheet","king","with pillow covers"]},
  {id:"H002",name:"Aartyz Indigo Floral Bedsheet",           category:"home_decor",subcategory:"bedsheets",gender:null,fabric:"cotton",color:"indigo",  size:["Double"], price:2100,originalPrice:2100,sale:false,stock:20,featured:false,newArrival:false,popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/03/Gemini_Generated_Image_xbehgsxbehgsxbeh-e1772440516640.png",tags:["bedsheet","double","floral"]},
  {id:"H003",name:"Aartyz Rust Kalamkari Single Bedsheet",   category:"home_decor",subcategory:"bedsheets",gender:null,fabric:"cotton",color:"rust",    size:["Single"], price:1440,originalPrice:1800,sale:true, stock:18,featured:false,newArrival:false,popular:false, image:"https://aartyz.in/wp-content/uploads/2026/03/Gemini_Generated_Image_xbehgsxbehgsxbeh-e1772440516640.png",tags:["bedsheet","single","kalamkari","sale"]},
  {id:"H004",name:"Aartyz Teal Geometric King Bedsheet Set", category:"home_decor",subcategory:"bedsheets",gender:null,fabric:"cotton",color:"teal",    size:["King"],   price:3400,originalPrice:3400,sale:false,stock:10,featured:true, newArrival:true, popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/03/Gemini_Generated_Image_xbehgsxbehgsxbeh-e1772440516640.png",tags:["bedsheet","king","geometric","with pillow covers"]},
  // ── HOME DECOR › CUSHION COVERS ───────────────────────────────────────────
  {id:"H010",name:"Aartyz Indigo Block Cushion Set (5 pcs)", category:"home_decor",subcategory:"cushion_covers",gender:null,fabric:"cotton",color:"indigo",  size:["Set of 5"],price:1200,originalPrice:1200,sale:false,stock:12,featured:true, newArrival:true, popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/03/Gemini_Generated_Image_xbehgsxbehgsxbeh-e1772440516640.png",tags:["cushion cover","set of 5","block print"]},
  {id:"H011",name:"Aartyz Floral Block Cushion Set (2 pcs)", category:"home_decor",subcategory:"cushion_covers",gender:null,fabric:"cotton",color:"multicolor",size:["Set of 2"],price:580,originalPrice:580,sale:false,stock:20,featured:false,newArrival:false,popular:false, image:"https://aartyz.in/wp-content/uploads/2026/03/Gemini_Generated_Image_xbehgsxbehgsxbeh-e1772440516640.png",tags:["cushion cover","set of 2","floral"]},
  {id:"H012",name:"Aartyz Rust Geometric Cushion Set (5 pcs)",category:"home_decor",subcategory:"cushion_covers",gender:null,fabric:"cotton",color:"rust",size:["Set of 5"],price:1120,originalPrice:1400,sale:true,stock:8,featured:false,newArrival:false,popular:true,image:"https://aartyz.in/wp-content/uploads/2026/03/Gemini_Generated_Image_xbehgsxbehgsxbeh-e1772440516640.png",tags:["cushion cover","set of 5","geometric","sale"]},
  // ── HOME DECOR › CURTAINS ─────────────────────────────────────────────────
  {id:"H020",name:"Aartyz Indigo Block Print Curtains (7ft pair)",category:"home_decor",subcategory:"curtains",gender:null,fabric:"cotton",color:"indigo",size:["7 ft"],price:2200,originalPrice:2200,sale:false,stock:10,featured:true, newArrival:true, popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/03/Gemini_Generated_Image_xbehgsxbehgsxbeh-e1772440516640.png",tags:["curtains","7ft","cotton","block print"]},
  {id:"H021",name:"Aartyz Rust Floral Window Curtains (5ft pair)",category:"home_decor",subcategory:"curtains",gender:null,fabric:"cotton",color:"rust",  size:["5 ft"],price:1600,originalPrice:1600,sale:false,stock:14,featured:false,newArrival:false,popular:false, image:"https://aartyz.in/wp-content/uploads/2026/03/Gemini_Generated_Image_xbehgsxbehgsxbeh-e1772440516640.png",tags:["curtains","5ft","cotton","floral"]},
  {id:"H022",name:"Aartyz Teal Kalamkari Door Curtains (9ft pair)",category:"home_decor",subcategory:"curtains",gender:null,fabric:"cotton",color:"teal", size:["9 ft"],price:2560,originalPrice:3200,sale:true, stock:8, featured:false,newArrival:false,popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/03/Gemini_Generated_Image_xbehgsxbehgsxbeh-e1772440516640.png",tags:["curtains","9ft","kalamkari","sale"]},
  // ── HOME DECOR › TABLE MATS & RUNNERS ────────────────────────────────────
  {id:"H030",name:"Aartyz Indigo Festive Table Runner",      category:"home_decor",subcategory:"table_mats",gender:null,fabric:"cotton",color:"indigo",  size:[],         price:680, originalPrice:680, sale:false,stock:22,featured:false,newArrival:true, popular:false, image:"https://aartyz.in/wp-content/uploads/2026/03/Gemini_Generated_Image_xbehgsxbehgsxbeh-e1772440516640.png",tags:["table runner","cotton","festive"]},
  {id:"H031",name:"Aartyz Floral Block Mat Set (6 pcs)",     category:"home_decor",subcategory:"table_mats",gender:null,fabric:"cotton",color:"multicolor",size:["Set of 6"],price:950,originalPrice:950,sale:false,stock:15,featured:false,newArrival:false,popular:true,image:"https://aartyz.in/wp-content/uploads/2026/03/Gemini_Generated_Image_xbehgsxbehgsxbeh-e1772440516640.png",tags:["table mats","set of 6","cotton","floral"]},
  {id:"H032",name:"Aartyz Rust Kalamkari Mat & Runner Combo",category:"home_decor",subcategory:"table_mats",gender:null,fabric:"cotton",color:"rust",    size:[],         price:1280,originalPrice:1600,sale:true, stock:10,featured:true, newArrival:false,popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/03/Gemini_Generated_Image_xbehgsxbehgsxbeh-e1772440516640.png",tags:["table mats","runner","combo","kalamkari","sale"]},
  // ── HOME DECOR › DINING COVERS ───────────────────────────────────────────
  {id:"H040",name:"Aartyz Indigo Floral Dining Cover (6-seater)",category:"home_decor",subcategory:"dining_covers",gender:null,fabric:"cotton",color:"indigo",size:["6 Seater"],price:1400,originalPrice:1400,sale:false,stock:12,featured:false,newArrival:true, popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/03/Gemini_Generated_Image_xbehgsxbehgsxbeh-e1772440516640.png",tags:["dining cover","6 seater","floral","cotton"]},
  {id:"H041",name:"Aartyz Rust Block Print Dining Cover (4-seater)",category:"home_decor",subcategory:"dining_covers",gender:null,fabric:"cotton",color:"rust",size:["4 Seater"],price:980,originalPrice:980,sale:false,stock:16,featured:false,newArrival:false,popular:false, image:"https://aartyz.in/wp-content/uploads/2026/03/Gemini_Generated_Image_xbehgsxbehgsxbeh-e1772440516640.png",tags:["dining cover","4 seater","block print","cotton"]},
  {id:"H042",name:"Aartyz Teal Kalamkari Dining Cover (8-seater)",category:"home_decor",subcategory:"dining_covers",gender:null,fabric:"cotton",color:"teal",size:["8 Seater"],price:1760,originalPrice:2200,sale:true,stock:8,featured:true,newArrival:false,popular:true,image:"https://aartyz.in/wp-content/uploads/2026/03/Gemini_Generated_Image_xbehgsxbehgsxbeh-e1772440516640.png",tags:["dining cover","8 seater","kalamkari","sale"]},
  // ── HOME DECOR › PILLOW COVERS ────────────────────────────────────────────
  {id:"H050",name:"Aartyz Indigo Block Pillow Set (2 pcs)",  category:"home_decor",subcategory:"pillow_covers",gender:null,fabric:"cotton",color:"indigo",  size:["Standard"],price:480,originalPrice:480,sale:false,stock:25,featured:false,newArrival:true, popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/03/Gemini_Generated_Image_xbehgsxbehgsxbeh-e1772440516640.png",tags:["pillow cover","set of 2","block print"]},
  {id:"H051",name:"Aartyz Floral Block Pillow Set (4 pcs)",  category:"home_decor",subcategory:"pillow_covers",gender:null,fabric:"cotton",color:"multicolor",size:["Standard"],price:880,originalPrice:880,sale:false,stock:18,featured:false,newArrival:false,popular:false, image:"https://aartyz.in/wp-content/uploads/2026/03/Gemini_Generated_Image_xbehgsxbehgsxbeh-e1772440516640.png",tags:["pillow cover","set of 4","floral"]},
  {id:"H052",name:"Aartyz Rust Paisley Pillow Set (2 pcs)",  category:"home_decor",subcategory:"pillow_covers",gender:null,fabric:"cotton",color:"rust",    size:["Standard"],price:440,originalPrice:550,sale:true,stock:20,featured:false,newArrival:false,popular:false, image:"https://aartyz.in/wp-content/uploads/2026/03/Gemini_Generated_Image_xbehgsxbehgsxbeh-e1772440516640.png",tags:["pillow cover","set of 2","paisley","sale"]},
  // ── HOME DECOR › RUNNERS ─────────────────────────────────────────────────
  {id:"H060",name:"Aartyz Indigo Geometric Table Runner",    category:"home_decor",subcategory:"runners",gender:null,fabric:"cotton",color:"indigo",  size:[],price:680, originalPrice:680, sale:false,stock:20,featured:false,newArrival:true, popular:false, image:"https://aartyz.in/wp-content/uploads/2026/03/Gemini_Generated_Image_xbehgsxbehgsxbeh-e1772440516640.png",tags:["table runner","geometric","cotton"]},
  {id:"H061",name:"Aartyz Floral Khadi Bed Runner",          category:"home_decor",subcategory:"runners",gender:null,fabric:"khadi", color:"multicolor",size:[],price:950, originalPrice:950, sale:false,stock:14,featured:false,newArrival:false,popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/03/Gemini_Generated_Image_xbehgsxbehgsxbeh-e1772440516640.png",tags:["bed runner","floral","khadi"]},
  {id:"H062",name:"Aartyz Rust Paisley Hallway Runner",      category:"home_decor",subcategory:"runners",gender:null,fabric:"cotton",color:"rust",    size:[],price:1120,originalPrice:1400,sale:true, stock:8, featured:false,newArrival:false,popular:false, image:"https://aartyz.in/wp-content/uploads/2026/03/Gemini_Generated_Image_xbehgsxbehgsxbeh-e1772440516640.png",tags:["hallway runner","paisley","sale"]},
  // ── GIFTING › MINI POUCH ─────────────────────────────────────────────────
  {id:"G001",name:"Aartyz Indigo Block Drawstring Pouch",    category:"gifting",subcategory:"mini_pouch",gender:null,fabric:"cotton",color:"indigo",  size:["Small"], price:180,originalPrice:180,sale:false,stock:100,featured:true, newArrival:true, popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/03/ChatGPT-Image-Mar-22-2026-03_49_40-PM.png",tags:["pouch","drawstring","cotton","bulk","gift"]},
  {id:"G002",name:"Aartyz Floral Zipper Pouch",              category:"gifting",subcategory:"mini_pouch",gender:null,fabric:"cotton",color:"multicolor",size:["Medium"],price:280,originalPrice:280,sale:false,stock:80, featured:false,newArrival:false,popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/03/ChatGPT-Image-Mar-22-2026-03_49_40-PM.png",tags:["pouch","zipper","cotton","gift"]},
  {id:"G003",name:"Aartyz Rust Kalamkari Drawstring Pouch",  category:"gifting",subcategory:"mini_pouch",gender:null,fabric:"cotton",color:"rust",    size:["Medium"],price:192,originalPrice:240,sale:true, stock:60, featured:false,newArrival:false,popular:false, image:"https://aartyz.in/wp-content/uploads/2026/03/ChatGPT-Image-Mar-22-2026-03_49_40-PM.png",tags:["pouch","drawstring","kalamkari","sale","gift"]},
  {id:"G004",name:"Aartyz Teal Block Print Zipper Pouch",    category:"gifting",subcategory:"mini_pouch",gender:null,fabric:"cotton",color:"teal",    size:["Large"], price:380,originalPrice:380,sale:false,stock:50, featured:true, newArrival:true, popular:false, image:"https://aartyz.in/wp-content/uploads/2026/03/ChatGPT-Image-Mar-22-2026-03_49_40-PM.png",tags:["pouch","zipper","teal","gift"]},
  // ── GIFTING › PLANTER COVERS ─────────────────────────────────────────────
  {id:"G010",name:"Aartyz Indigo Block Planter Cover (Small)",category:"gifting",subcategory:"planter_covers",gender:null,fabric:"cotton",color:"indigo",  size:["Small"], price:220,originalPrice:220,sale:false,stock:40,featured:false,newArrival:true, popular:false, image:"https://aartyz.in/wp-content/uploads/2026/03/Gemini_Generated_Image_xbehgsxbehgsxbeh-e1772440516640.png",tags:["planter cover","small","cotton","gift"]},
  {id:"G011",name:"Aartyz Floral Block Planter Cover (Medium)",category:"gifting",subcategory:"planter_covers",gender:null,fabric:"cotton",color:"multicolor",size:["Medium"],price:340,originalPrice:340,sale:false,stock:30,featured:false,newArrival:false,popular:true,image:"https://aartyz.in/wp-content/uploads/2026/03/Gemini_Generated_Image_xbehgsxbehgsxbeh-e1772440516640.png",tags:["planter cover","medium","cotton","gift"]},
  {id:"G012",name:"Aartyz Rust Kalamkari Planter Cover (Large)",category:"gifting",subcategory:"planter_covers",gender:null,fabric:"cotton",color:"rust",size:["Large"],price:464,originalPrice:580,sale:true,stock:20,featured:true,newArrival:false,popular:true,image:"https://aartyz.in/wp-content/uploads/2026/03/Gemini_Generated_Image_xbehgsxbehgsxbeh-e1772440516640.png",tags:["planter cover","large","kalamkari","sale","gift"]},
  // ── GIFTING › FABRIC COASTERS ────────────────────────────────────────────
  {id:"G020",name:"Aartyz Indigo Block Coaster Set (4 pcs)", category:"gifting",subcategory:"fabric_coasters",gender:null,fabric:"cotton",color:"indigo",  size:["Set of 4"],price:320,originalPrice:320,sale:false,stock:50,featured:true, newArrival:true, popular:true,  image:"https://aartyz.in/wp-content/uploads/2026/03/ChatGPT-Image-Mar-22-2026-03_49_40-PM.png",tags:["coasters","set of 4","block print","gift"]},
  {id:"G021",name:"Aartyz Floral Block Coaster Set (6 pcs)", category:"gifting",subcategory:"fabric_coasters",gender:null,fabric:"cotton",color:"multicolor",size:["Set of 6"],price:480,originalPrice:480,sale:false,stock:40,featured:false,newArrival:false,popular:true,image:"https://aartyz.in/wp-content/uploads/2026/03/ChatGPT-Image-Mar-22-2026-03_49_40-PM.png",tags:["coasters","set of 6","floral","gift"]},
  {id:"G022",name:"Aartyz Rust Kalamkari Coaster Set (4 pcs)",category:"gifting",subcategory:"fabric_coasters",gender:null,fabric:"cotton",color:"rust",size:["Set of 4"],price:360,originalPrice:360,sale:false,stock:35,featured:false,newArrival:true, popular:false, image:"https://aartyz.in/wp-content/uploads/2026/03/ChatGPT-Image-Mar-22-2026-03_49_40-PM.png",tags:["coasters","set of 4","kalamkari","gift"]},
];

// ─────────────────────────────────────────────────────────────────────────────
//  IN-MEMORY FILTER ENGINE  (replaces the FastAPI backend entirely)
// ─────────────────────────────────────────────────────────────────────────────

// Maps page id → default filter constraints applied automatically on open
const PAGE_DEFAULTS = {
  shop:              {},
  newarrivals:       { newArrival: true },
  sale:              { sale: true },
  'w-sarees':        { category:'women',     subcategory:'sarees'          },
  'w-coords':        { category:'women',     subcategory:'coords'          },
  'w-onepiecedress': { category:'women',     subcategory:'one_piece_dress' },
  'w-topsshirts':    { category:'women',     subcategory:'tops_shirts'     },
  'w-kurtis':        { category:'women',     subcategory:'kurtis'          },
  'w-palazzo':       { category:'women',     subcategory:'palazzo_lowers'  },
  'w-dupatta':       { category:'women',     subcategory:'dupatta'         },
  'w-skirts':        { category:'women',     subcategory:'cotton_skirts'   },
  'w-dressmaterial': { category:'women',     subcategory:'dress_material'  },
  'w-blouse':        { category:'women',     subcategory:'blouse'          },
  'm-shirts':        { category:'men',       subcategory:'shirts'          },
  'm-blockprint':    { category:'men',       subcategory:'block_print_shirts'},
  'm-kalamkari':     { category:'men',       subcategory:'kalamkari_shirts'},
  'm-blazers':       { category:'men',       subcategory:'ethnic_blazers'  },
  'm-jackets':       { category:'men',       subcategory:'modi_jackets'    },
  'd-bedsheets':     { category:'home_decor',subcategory:'bedsheets'       },
  'd-pillow':        { category:'home_decor',subcategory:'pillow_covers'   },
  'd-cushion':       { category:'home_decor',subcategory:'cushion_covers'  },
  'd-dining':        { category:'home_decor',subcategory:'dining_covers'   },
  'd-tablemats':     { category:'home_decor',subcategory:'table_mats'      },
  'd-curtains':      { category:'home_decor',subcategory:'curtains'        },
  'd-runners':       { category:'home_decor',subcategory:'runners'         },
  'g-minipouch':     { category:'gifting',   subcategory:'mini_pouch'      },
  'g-planter':       { category:'gifting',   subcategory:'planter_covers'  },
  'g-coasters':      { category:'gifting',   subcategory:'fabric_coasters' },
};

// Maps filter group heading text → product field key
const GROUP_FIELD_MAP = {
  'fabric':   'fabric',
  'color':    'color',
  'size':     'size',
  'gender':   'gender',
  'print':    'tags',
  'type':     'tags',
  'category': 'category_filter',  // special handling below
  'length':   'tags',
};

// Parses price range from label text → {min, max}  (null = unbounded)
function parsePriceLabel(label) {
  // "Under ₹X,XXX"
  const under = label.match(/under\s*₹?\s*([\d,]+)/i);
  if (under) return { min: null, max: parseInt(under[1].replace(/,/g, '')) };
  // "Above ₹X,XXX"
  const above = label.match(/above\s*₹?\s*([\d,]+)/i);
  if (above) return { min: parseInt(above[1].replace(/,/g, '')), max: null };
  // "₹X,XXX – ₹Y,YYY"  or  "₹X,XXX - ₹Y,YYY"
  const range = label.match(/([\d,]+)\s*[–\-]\s*₹?\s*([\d,]+)/);
  if (range) return {
    min: parseInt(range[1].replace(/,/g, '')),
    max: parseInt(range[2].replace(/,/g, ''))
  };
  return null;
}

// Main filter + sort function — pure, no side-effects
function queryProducts(params) {
  let results = PRODUCTS.slice();

  // Category
  if (params.category)
    results = results.filter(p => p.category === params.category);

  // Subcategory — partial match so "shirts" hits "block_print_shirts" too
  if (params.subcategory)
    results = results.filter(p => p.subcategory.includes(params.subcategory));

  // Gender
  if (params.gender)
    results = results.filter(p => p.gender === params.gender);

  // Boolean flags
  if (params.sale      === true) results = results.filter(p => p.sale);
  if (params.newArrival=== true) results = results.filter(p => p.newArrival);
  if (params.featured  === true) results = results.filter(p => p.featured);

  // Fabric (exact, case-insensitive)
  if (params.fabric)
    results = results.filter(p => p.fabric.toLowerCase() === params.fabric.toLowerCase());

  // Color
  if (params.color)
    results = results.filter(p => p.color.toLowerCase() === params.color.toLowerCase());

  // Size (value must appear in product's size array)
  if (params.size)
    results = results.filter(p =>
      p.size.some(s => s.toLowerCase() === params.size.toLowerCase())
    );

  // Price range
  if (params.priceMin != null)
    results = results.filter(p => p.price >= params.priceMin);
  if (params.priceMax != null)
    results = results.filter(p => p.price <= params.priceMax);

  // Free-text search (name, tags, fabric, color, subcategory)
  if (params.search) {
    const q = params.search.toLowerCase();
    results = results.filter(p =>
      p.name.toLowerCase().includes(q)      ||
      p.fabric.toLowerCase().includes(q)    ||
      p.color.toLowerCase().includes(q)     ||
      p.subcategory.toLowerCase().includes(q)||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  // Sort
  switch (params.sort) {
    case 'price_low':  results.sort((a,b) => a.price - b.price);       break;
    case 'price_high': results.sort((a,b) => b.price - a.price);       break;
    case 'newest':     results.sort((a,b) => b.newArrival - a.newArrival); break;
    case 'name':       results.sort((a,b) => a.name.localeCompare(b.name)); break;
    default:           results.sort((a,b) => (b.popular - a.popular) || (b.featured - a.featured)); break;
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
//  READ UI STATE FROM A PRODUCT PAGE ELEMENT
// ─────────────────────────────────────────────────────────────────────────────
const SORT_MAP = {
  'newest first':      'newest',
  'price: low → high': 'price_low',
  'price: high → low': 'price_high',
  'best selling':      'popular',
  'best sellers':      'popular',
};

function buildParamsFromUI(pageEl, pageId) {
  const params = { ...PAGE_DEFAULTS[pageId] };

  // ── Sidebar checkboxes ─────────────────────────────────────────────────────
  pageEl.querySelectorAll('.filter-group').forEach(group => {
    const titleEl = group.querySelector('.filter-group-title');
    if (!titleEl) return;
    const title    = titleEl.textContent.trim().toLowerCase();
    const field    = GROUP_FIELD_MAP[title];

    group.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
      const label = cb.closest('label')
        ?.querySelector('.filter-option-label')
        ?.textContent?.trim() || '';

      if (title === 'price') {
        const parsed = parsePriceLabel(label);
        if (parsed) {
          if (parsed.min != null) params.priceMin = parsed.min;
          if (parsed.max != null) params.priceMax = parsed.max;
        }
        return;
      }

      if (!field) return;

      if (field === 'tags') {
        params.search = (params.search ? params.search + ' ' : '') + label.toLowerCase();
      } else if (field === 'size') {
        params.size = label;
      } else if (field === 'category_filter') {
        // Map label to gender or category
        const lbl = label.toLowerCase().replace("'s", '');
        if (lbl === 'women') params.gender = 'women';
        else if (lbl === 'men') params.gender = 'men';
        else if (lbl === 'home decor') params.category = 'home_decor';
        else if (lbl === 'gifting') params.category = 'gifting';
      } else {
        params[field] = label.toLowerCase();
      }
    });
  });

  // ── Filter tabs (read data attributes) ────────────────────────────────────
  const activeTab = pageEl.querySelector('.filter-tab.active');
  if (activeTab) {
    const gender = activeTab.dataset.gender;
    const category = activeTab.dataset.category;
    if (gender) {
      params.gender = gender;
      delete params.category;
    } else if (category) {
      params.category = category;
      delete params.gender;
    } else {
      // "All" tab - remove gender/category overrides
      delete params.gender;
      if (!PAGE_DEFAULTS[pageId] || !PAGE_DEFAULTS[pageId].category) {
        delete params.category;
      }
    }
  }

  // ── Sort dropdown (.ps-sort or .sort-box) ─────────────────────────────────
  const sortSel = pageEl.querySelector('.ps-sort, .sort-box');
  if (sortSel) {
    const key = sortSel.value.trim().toLowerCase();
    if (SORT_MAP[key]) params.sort = SORT_MAP[key];
  }

  return params;
}

// ─────────────────────────────────────────────────────────────────────────────
//  RENDER ENGINE
// ─────────────────────────────────────────────────────────────────────────────
function renderAndUpdate(pageEl, pageId) {
  const grid    = pageEl.querySelector('.prod-grid');
  const countEl = pageEl.querySelector('.ps-count, .shop-count-text');
  if (!grid) return;

  const params   = buildParamsFromUI(pageEl, pageId);
  const products = queryProducts(params);

  // Update count
  if (countEl) countEl.textContent = `${products.length} product${products.length !== 1 ? 's' : ''}`;

  // Render active-filter badge on sidebar title
  _updateFilterBadge(pageEl, params, pageId);

  // Render grid
  if (!products.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:80px 20px;color:var(--muted)">
        <div style="font-size:48px;margin-bottom:16px">🔍</div>
        <h3 style="font-family:var(--ff-display);font-size:22px;color:var(--earth);margin-bottom:8px">No products found</h3>
        <p style="font-size:14px;margin-bottom:24px">Try adjusting or clearing your filters.</p>
        <button onclick="clearFilters(this)"
          style="background:var(--saffron);color:#fff;border:none;
                 padding:12px 28px;font-size:13px;letter-spacing:.08em;
                 text-transform:uppercase;cursor:pointer;font-family:var(--ff-body)">
          Clear Filters
        </button>
      </div>`;
    return;
  }

  grid.innerHTML = products.map(cardHTML).join('');

  // Stagger-reveal newly injected cards
  grid.querySelectorAll('.prod-card').forEach((el, i) => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition= `opacity .4s ease ${i * 35}ms, transform .4s ease ${i * 35}ms`;
    requestAnimationFrame(() => {
      el.style.opacity   = '1';
      el.style.transform = 'translateY(0)';
    });
  });
}

function cardHTML(p) {
  const isOnSale = p.sale && p.originalPrice > p.price;
  const badge    = isOnSale
    ? `<div class="prod-badge badge-sale">Sale</div>`
    : p.newArrival
      ? `<div class="prod-badge badge-new">New</div>`
      : '';

  const priceHTML = isOnSale
    ? `<span class="prod-original">₹${p.originalPrice.toLocaleString('en-IN')}</span>
       <span class="prod-sale">₹${p.price.toLocaleString('en-IN')}</span>`
    : `<span class="prod-price">₹${p.price.toLocaleString('en-IN')}</span>`;

  const subcatLabel = p.subcategory.replace(/_/g,' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  const catLabel = p.category.replace(/_/g,' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  return `
    <a href="javascript:void(0)" class="prod-card-wrap" data-product-name="${p.name}" onclick="openProduct(this.dataset.productName)" style="display:block;text-decoration:none;color:inherit">
    <div class="prod-card" data-id="${p.id}">
      <div class="prod-img-wrap">
        <img src="${p.image}" alt="${p.name}" loading="lazy"
             onerror="this.src='https://aartyz.in/wp-content/uploads/2025/05/logo1-3-300x300.png'">
        ${badge}
        <button class="prod-wish" onclick="toggleWish(event,this)" aria-label="Wishlist">♡</button>
        <div class="prod-img-hover">
          <span class="prod-add-btn">View &amp; Buy →</span>
        </div>
      </div>
      <div class="prod-meta">
        <div class="prod-cat">${catLabel} · ${subcatLabel}</div>
        <div class="prod-name">${p.name}</div>
        <div class="prod-price-row">${priceHTML}</div>
      </div>
    </div>
    </a>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  FILTER PAGE INITIALISER  (called once per page open)
// ─────────────────────────────────────────────────────────────────────────────
function initPageFilters(pageEl, pageId) {
  // Reset all checkboxes
  pageEl.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });

  // Wire checkboxes
  pageEl.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => renderAndUpdate(pageEl, pageId));
  });

  // Wire sort select
  const sortSel = pageEl.querySelector('.ps-sort, .sort-box');
  if (sortSel)
    sortSel.addEventListener('change', () => renderAndUpdate(pageEl, pageId));

  // Wire filter tabs
  pageEl.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', function () {
      this.closest('.filter-tabs').querySelectorAll('.filter-tab')
        .forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      renderAndUpdate(pageEl, pageId);
    });
  });

  // Initial render
  renderAndUpdate(pageEl, pageId);
}

// ─────────────────────────────────────────────────────────────────────────────
//  ACTIVE FILTER BADGE
// ─────────────────────────────────────────────────────────────────────────────
function _updateFilterBadge(pageEl, params, pageId) {
  const titleEl = pageEl.querySelector('.sidebar-title, .ps-sidebar .sidebar-title');
  if (!titleEl) return;
  titleEl.querySelectorAll('._fbadge').forEach(b => b.remove());

  const defaults = PAGE_DEFAULTS[pageId] || {};
  const extras   = Object.keys(params).filter(k =>
    !['sort','limit','page'].includes(k) && !(k in defaults)
  ).length;

  if (extras > 0) {
    const span = document.createElement('span');
    span.className  = '_fbadge';
    span.textContent= extras;
    span.style.cssText = `
      display:inline-flex;align-items:center;justify-content:center;
      width:18px;height:18px;border-radius:50%;
      background:var(--saffron);color:#fff;
      font-size:10px;font-weight:700;margin-left:8px;vertical-align:middle;`;
    titleEl.appendChild(span);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  CLEAR FILTERS
// ─────────────────────────────────────────────────────────────────────────────
function clearFilters(triggerEl) {
  const pageEl = triggerEl
    ? triggerEl.closest('.aartyz-page')
    : document.getElementById('page-' + _currentPage);
  if (!pageEl) return;

  pageEl.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => cb.checked = false);

  const sortSel = pageEl.querySelector('.ps-sort, .sort-box');
  if (sortSel) sortSel.selectedIndex = 0;

  pageEl.querySelectorAll('.filter-tab').forEach((t, i) =>
    t.classList.toggle('active', i === 0)
  );

  renderAndUpdate(pageEl, _currentPage);
}

// ─────────────────────────────────────────────────────────────────────────────
//  INJECT "CLEAR" BUTTON INTO EVERY SIDEBAR TITLE (once on load)
// ─────────────────────────────────────────────────────────────────────────────
function injectClearButtons() {
  document.querySelectorAll('.ps-sidebar .sidebar-title, .sidebar .sidebar-title').forEach(title => {
    if (title.querySelector('._cbtn')) return;
    const btn = document.createElement('button');
    btn.className   = '_cbtn';
    btn.textContent = 'Clear';
    btn.style.cssText = `
      float:right;background:none;border:none;
      font-size:11px;color:var(--saffron);letter-spacing:.06em;
      text-transform:uppercase;cursor:pointer;font-family:var(--ff-body);
      padding:0;margin-top:2px;`;
    btn.addEventListener('click', () => clearFilters(btn));
    title.appendChild(btn);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  NAV / ROUTING / EXISTING FUNCTIONS (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () =>
  nav.classList.toggle('scrolled', window.scrollY > 60)
);

function openMob() { document.getElementById('mobMenu').classList.add('open'); }
function closeMob() { document.getElementById('mobMenu').classList.remove('open'); }

const ANIMATE_CLASSES = '.feat-item,.testi-card,.p-step,.cat-tile,.value-item,.gift-perk,.bundle-card,.care-item,.mto-step';

const observer = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  }),
  { threshold: 0.1 }
);

document.querySelectorAll(ANIMATE_CLASSES).forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity .65s ease, transform .65s ease';
  observer.observe(el);
});

let _currentPage = null;

function go(page) {
  _currentPage = page;
  var target = document.getElementById('page-' + page);
  if (!target) return;

  // Scroll to top
  window.scrollTo(0, 0);

  // Use inline styles directly - overrides ALL CSS including !important
  document.querySelectorAll('.aartyz-page').forEach(function(p) {
    p.style.setProperty('display', 'none', 'important');
    p.classList.remove('active');
  });
  target.style.setProperty('display', 'block', 'important');
  target.classList.add('active');
  target.querySelectorAll('.feat-item,.testi-card,.p-step,.cat-tile,.value-item,.gift-perk,.bundle-card,.care-item,.mto-step').forEach(function(el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity .65s ease, transform .65s ease';
    setTimeout(function(){ observer.observe(el); }, 50);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // No URL hash - prevents browser anchor scrolling
  if (window.history && window.history.replaceState) {
    window.history.replaceState(null, '', window.location.pathname);
  }

  if (typeof PAGE_DEFAULTS !== 'undefined' && PAGE_DEFAULTS[page] !== undefined) {
    try { initPageFilters(target, page); } catch(e) {}
  }
}


function setSubcat(el) {
  el.closest('.subcat-inner')?.querySelectorAll('.subcat-pill')
    .forEach(p => p.classList.remove('active'));
  el.classList.add('active');
}

function toggleWish(e, btn) {
  if(e) e.stopPropagation();
  const on = btn.textContent === '♥';
  btn.textContent = on ? '♡' : '♥';
  btn.style.color = on ? '' : 'var(--saffron)';
}

// ── CART ────────────────────────────────────────────────────────────────────
let cartCount = 0;
function addCart() {
  cartCount++;
  const dot = document.getElementById('cartDot');
  if (!dot) return;
  dot.classList.add('show');
  dot.style.transform = 'scale(1.6)';
  setTimeout(() => (dot.style.transform = 'scale(1)'), 200);
}

// ── COUNTDOWN ───────────────────────────────────────────────────────────────
function runCountdown() {
  const end = new Date();
  end.setHours(end.getHours() + 8, end.getMinutes() + 24, end.getSeconds() + 15);
  setInterval(() => {
    const diff = Math.max(0, end - new Date());
    const pad  = n => String(Math.floor(n)).padStart(2, '0');
    const hEl  = document.getElementById('cd-h');
    const mEl  = document.getElementById('cd-m');
    const sEl  = document.getElementById('cd-s');
    if (hEl) hEl.textContent = pad(diff / 3600000);
    if (mEl) mEl.textContent = pad((diff % 3600000) / 60000);
    if (sEl) sEl.textContent = pad((diff % 60000) / 1000);
  }, 1000);
}
runCountdown();

// ── SEARCH (nav search inputs) ───────────────────────────────────────────────
function initSearchInputs() {
  document.querySelectorAll('input[type="search"], .nav-search-input, .search-input').forEach(input => {
    let debounce;
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        const q = input.value.trim();
        if (q.length < 2) return;
        // Navigate to shop page and filter inline
        go('shop');
        const shopPage = document.getElementById('page-shop');
        if (!shopPage) return;
        const grid = shopPage.querySelector('.prod-grid');
        const countEl = shopPage.querySelector('.ps-count, .shop-count-text');
        if (!grid) return;
        const results = queryProducts({ search: q });
        if (countEl) countEl.textContent = `${results.length} products`;
        grid.innerHTML = results.map(cardHTML).join('');
      }, 300);
    });
  });
}
// ── INIT ─────────────────────────────────────────────────────────────────────
function aartyzBoot() {
  var hash = window.location.hash;
  var startPage = 'home';
  if (hash && hash.indexOf('#page-') === 0) {
    var hid = hash.replace('#page-', '');
    if (document.getElementById('page-' + hid)) startPage = hid;
  }

  var target = document.getElementById('page-' + startPage);
  if (target) {
    // Mark active BEFORE enabling spa-mode (atomic - no blank frame)
    // Hide all pages first
    document.querySelectorAll('.aartyz-page').forEach(function(p) {
      p.style.setProperty('display', 'none', 'important');
      p.classList.remove('active');
    });
    // Show target with inline style
    target.style.setProperty('display', 'block', 'important');
    target.classList.add('active');
    _currentPage = startPage;
    if (typeof PAGE_DEFAULTS !== 'undefined' && PAGE_DEFAULTS[startPage] !== undefined) {
      try { initPageFilters(target, startPage); } catch(e) {}
    }
  }

  try { injectClearButtons(); } catch(e) {}
  try { initSearchInputs(); } catch(e) {}
  // Render homepage new arrivals grid
  try { renderHomeNewArrivals('', ''); } catch(e) {}

  window.addEventListener('hashchange', function() {
    var h = window.location.hash;
    if (h && h.indexOf('#page-') === 0) go(h.replace('#page-', ''));
  });
}

// Run immediately — JS loads in footer so DOM is already ready
aartyzBoot();



// ─────────────────────────────────────────────────────────────────────────────
//  CART  (in-memory store)
// ─────────────────────────────────────────────────────────────────────────────
let cart = [];
let wishlist = [];
let currentProduct = null;

function addToCart(product, qty) {
  qty = qty || parseInt(document.getElementById('prod-qty')?.value) || 1;
  const existing = cart.find(i => i.id === product.id && i.size === (product.selectedSize || ''));
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ ...product, qty, size: product.selectedSize || '' });
  }
  updateCartBadge();
  showToast('Added to cart ✓');
  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartBadge();
  renderCart();
}

function updateCartQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  updateCartBadge();
  renderCart();
}

function updateCartBadge() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const dot = document.getElementById('cartDot');
  if (dot) {
    dot.classList.toggle('show', count > 0);
    dot.textContent = count > 0 ? count : '';
    dot.style.transform = 'scale(1.4)';
    setTimeout(() => dot.style.transform = 'scale(1)', 200);
  }
}

function renderCart() {
  const itemsEl   = document.getElementById('cart-items');
  const emptyEl   = document.getElementById('cart-empty');
  const summaryEl = document.getElementById('cart-summary');
  if (!itemsEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = '';
    if (emptyEl)   emptyEl.style.display = 'block';
    if (summaryEl) summaryEl.style.display = 'none';
    return;
  }

  if (emptyEl)   emptyEl.style.display = 'none';
  if (summaryEl) summaryEl.style.display = 'block';

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 1500 ? 0 : 99;

  itemsEl.innerHTML = cart.map((item, idx) => `
    <div style="display:grid;grid-template-columns:100px 1fr auto;gap:20px;padding:24px 0;border-bottom:1px solid var(--blush);align-items:center">
      <img src="${item.image}" alt="${item.name}" style="width:100px;aspect-ratio:3/4;object-fit:cover;background:var(--blush)">
      <div>
        <div style="font-size:11px;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px">${item.category}</div>
        <div style="font-family:var(--ff-display);font-size:18px;color:var(--earth);margin-bottom:8px">${item.name}</div>
        ${item.size ? `<div style="font-size:13px;color:var(--muted)">Size: ${item.size}</div>` : ''}
        <div style="display:flex;align-items:center;gap:12px;margin-top:12px">
          <div style="display:flex;align-items:center;border:1px solid rgba(0,0,0,.15)">
            <button onclick="updateCartQty(${idx},-1)" style="width:32px;height:32px;background:none;border:none;cursor:pointer;font-size:16px;color:var(--earth)">−</button>
            <span style="width:32px;text-align:center;font-size:14px">${item.qty}</span>
            <button onclick="updateCartQty(${idx},1)" style="width:32px;height:32px;background:none;border:none;cursor:pointer;font-size:16px;color:var(--earth)">+</button>
          </div>
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-size:18px;font-weight:600;color:var(--earth);margin-bottom:12px">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
        <button onclick="removeFromCart(${idx})" style="background:none;border:none;color:var(--muted);font-size:12px;cursor:pointer;text-decoration:underline">Remove</button>
      </div>
    </div>
  `).join('');

  const subtotalEl = document.getElementById('cart-subtotal');
  const shippingEl = document.getElementById('cart-shipping');
  const totalEl    = document.getElementById('cart-total');
  if (subtotalEl) subtotalEl.textContent = '₹' + subtotal.toLocaleString('en-IN');
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Free' : '₹' + shipping;
  if (totalEl)    totalEl.textContent    = '₹' + (subtotal + shipping).toLocaleString('en-IN');

  // Sync checkout
  const csub = document.getElementById('checkout-subtotal');
  const ctot = document.getElementById('checkout-total');
  const citems = document.getElementById('checkout-items');
  if (csub) csub.textContent = '₹' + subtotal.toLocaleString('en-IN');
  if (ctot) ctot.textContent = '₹' + (subtotal + shipping).toLocaleString('en-IN');
  if (citems) {
    citems.innerHTML = cart.map(i => `
      <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--muted);padding:8px 0;border-bottom:1px solid var(--blush)">
        <span>${i.name} × ${i.qty}</span>
        <span style="color:var(--earth)">₹${(i.price * i.qty).toLocaleString('en-IN')}</span>
      </div>
    `).join('');
  }
}

function applyCoupon() {
  const code = document.getElementById('coupon-input')?.value?.toUpperCase();
  const discountEl = document.getElementById('cart-discount');
  if (code === 'FIRSTBUY' && discountEl) {
    discountEl.textContent = '−₹400';
    showToast('Coupon applied! ₹400 off ✓');
  } else {
    showToast('Invalid coupon code');
  }
}

function placeOrder() {
  cart = [];
  updateCartBadge();
  renderCart();
  go('order-confirmed');
}

// ─────────────────────────────────────────────────────────────────────────────
//  WISHLIST
// ─────────────────────────────────────────────────────────────────────────────
function addToWishlist(product) {
  const exists = wishlist.find(p => p.id === product.id);
  if (!exists) {
    wishlist.push(product);
    showToast('Saved to wishlist ♡');
    renderWishlist();
  } else {
    showToast('Already in wishlist');
  }
}

function removeFromWishlist(id) {
  wishlist = wishlist.filter(p => p.id !== id);
  renderWishlist();
}

function renderWishlist() {
  const grid    = document.getElementById('wishlist-grid');
  const emptyEl = document.getElementById('wishlist-empty');
  if (!grid) return;
  if (wishlist.length === 0) {
    grid.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';
  grid.innerHTML = wishlist.map(p => `
    <div class="prod-card">
      <div class="prod-img-wrap" onclick="openProduct('${p.name.replace(/'/g,"\'")}')">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <button class="prod-wish" onclick="event.stopPropagation();removeFromWishlist('${p.id}')" style="color:var(--saffron)">♥</button>
        <div class="prod-img-hover">
          <button class="prod-add-btn" onclick="event.stopPropagation();addToCart(${JSON.stringify(p).replace(/"/g,"'")})">Add to Cart</button>
        </div>
      </div>
      <div class="prod-meta">
        <div class="prod-cat">${p.category}</div>
        <div class="prod-name">${p.name}</div>
        <div class="prod-price-row"><span class="prod-price">₹${p.price.toLocaleString('en-IN')}</span></div>
      </div>
    </div>
  `).join('');
}

// ─────────────────────────────────────────────────────────────────────────────
//  PRODUCT DETAIL PAGE
// ─────────────────────────────────────────────────────────────────────────────
function openProduct(name) {
  // Find product in PRODUCTS array
  const p = PRODUCTS.find(pr => pr.name === name) ||
            PRODUCTS.find(pr => pr.name.toLowerCase().includes(name.toLowerCase()));
  if (!p) { go('shop'); return; }

  currentProduct = { ...p };

  // Populate page
  document.getElementById('prod-title').textContent = p.name;
  document.getElementById('prod-img').src = p.image;
  document.getElementById('prod-img').alt = p.name;
  document.getElementById('prod-cat-label').textContent = p.category + ' · ' + p.subcategory.replace(/_/g,' ');
  document.getElementById('prod-breadcrumb-name').textContent = p.name;

  const catEl = document.getElementById('prod-breadcrumb-cat');
  catEl.textContent = p.category;
  catEl.onclick = function() { go(p.category === 'women' ? 'women' : p.category === 'men' ? 'men' : p.category === 'home_decor' ? 'decor' : 'gifting'); };

  // Sale badge
  const badge = document.getElementById('prod-sale-badge');
  if (badge) badge.style.display = p.sale ? 'block' : 'none';

  // Price
  const priceEl = document.getElementById('prod-price');
  if (p.sale && p.originalPrice > p.price) {
    priceEl.innerHTML = `
      <span style="font-size:28px;font-weight:600;color:var(--earth)">₹${p.price.toLocaleString('en-IN')}</span>
      <span style="font-size:18px;color:var(--muted);text-decoration:line-through">₹${p.originalPrice.toLocaleString('en-IN')}</span>
      <span style="font-size:13px;color:var(--saffron);font-weight:600">Save ₹${(p.originalPrice - p.price).toLocaleString('en-IN')}</span>`;
  } else {
    priceEl.innerHTML = `<span style="font-size:28px;font-weight:600;color:var(--earth)">₹${p.price.toLocaleString('en-IN')}</span>`;
  }

  // Sizes
  const sizeSection = document.getElementById('prod-size-section');
  const sizesEl     = document.getElementById('prod-sizes');
  if (p.size && p.size.length > 0) {
    sizeSection.style.display = 'block';
    sizesEl.innerHTML = p.size.map(s => `
      <button onclick="selectSize(this,'${s}')" 
        style="padding:8px 18px;border:1px solid rgba(0,0,0,.15);background:none;
               font-family:var(--ff-body);font-size:13px;color:var(--earth);cursor:pointer;transition:all .2s">
        ${s}
      </button>`).join('');
  } else {
    sizeSection.style.display = 'none';
  }

  // Meta info
  const metaEl = document.getElementById('prod-meta-info');
  metaEl.innerHTML = `
    <div><strong style="color:var(--earth)">Fabric:</strong> ${p.fabric}</div>
    <div><strong style="color:var(--earth)">Colour:</strong> ${p.color}</div>
    <div><strong style="color:var(--earth)">SKU:</strong> ${p.id}</div>
    <div><strong style="color:var(--earth)">Availability:</strong> ${p.stock > 0 ? `In Stock (${p.stock} left)` : 'Out of Stock'}</div>`;

  // Related products
  const related = PRODUCTS.filter(pr =>
    pr.id !== p.id && (pr.category === p.category || pr.subcategory === p.subcategory)
  ).slice(0, 4);
  const relatedEl = document.getElementById('prod-related');
  if (relatedEl) {
    relatedEl.innerHTML = related.map(r => cardHTML(r)).join('');
  }

  // Reset qty
  const qtyEl = document.getElementById('prod-qty');
  if (qtyEl) qtyEl.value = 1;

  go('product');
}

function selectSize(btn, size) {
  btn.closest('#prod-sizes').querySelectorAll('button').forEach(b => {
    b.style.background = 'none';
    b.style.color = 'var(--earth)';
  });
  btn.style.background = 'var(--earth)';
  btn.style.color = '#fff';
  if (currentProduct) currentProduct.selectedSize = size;
}

function changeProductQty(delta) {
  const input = document.getElementById('prod-qty');
  if (!input) return;
  const val = Math.max(1, parseInt(input.value) + delta);
  input.value = val;
}

function toggleAcc(head) {
  const body = head.nextElementSibling;
  const isOpen = body.style.display === 'block';
  // Close all in same container
  head.closest('div').parentElement.querySelectorAll('button + div').forEach(b => b.style.display = 'none');
  head.closest('div').parentElement.querySelectorAll('button span').forEach(s => s.textContent = '+');
  if (!isOpen) {
    body.style.display = 'block';
    head.querySelector('span').textContent = '−';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  SEARCH PAGE
// ─────────────────────────────────────────────────────────────────────────────
function searchProducts(query) {
  const resultsEl = document.getElementById('search-results');
  const countEl   = document.getElementById('search-count');
  if (!resultsEl) return;
  if (!query || query.length < 2) {
    resultsEl.innerHTML = '';
    if (countEl) countEl.textContent = '';
    return;
  }
  const q = query.toLowerCase();
  const results = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.fabric.toLowerCase().includes(q) ||
    p.color.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.subcategory.toLowerCase().includes(q) ||
    p.tags.some(t => t.toLowerCase().includes(q))
  );
  if (countEl) countEl.textContent = results.length + ' product' + (results.length !== 1 ? 's' : '') + ' found';
  resultsEl.innerHTML = results.map(p => cardHTML(p)).join('');
}

// ─────────────────────────────────────────────────────────────────────────────
//  TOAST NOTIFICATION
// ─────────────────────────────────────────────────────────────────────────────
function showToast(message) {
  let toast = document.getElementById('aartyz-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'aartyz-toast';
    toast.style.cssText = `
      position:fixed;bottom:32px;left:50%;transform:translateX(-50%) translateY(20px);
      background:var(--earth);color:#fff;padding:14px 28px;font-family:var(--ff-body);
      font-size:13px;letter-spacing:.05em;z-index:9999;opacity:0;
      transition:all .3s ease;pointer-events:none;white-space:nowrap;`;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 2500);
}

// ─────────────────────────────────────────────────────────────────────────────
//  WIRE UP NAV ICONS to new pages
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  // Search icon
  var searchBtns = document.querySelectorAll('.nav-icon[title="Search"]');
  searchBtns.forEach(function(btn) {
    btn.onclick = function() { go('search'); };
  });
  // Wishlist icon
  var wishBtns = document.querySelectorAll('.nav-icon[title="Wishlist"]');
  wishBtns.forEach(function(btn) {
    btn.onclick = function() { renderWishlist(); go('wishlist'); };
  });
  // Cart icon
  var cartBtns = document.querySelectorAll('.nav-icon[title="Cart"]');
  cartBtns.forEach(function(btn) {
    btn.onclick = function() { renderCart(); go('cart'); };
  });
});


// ─────────────────────────────────────────────────────────────────────────────
//  HOMEPAGE — NEW ARRIVALS DYNAMIC GRID
// ─────────────────────────────────────────────────────────────────────────────
function renderHomeNewArrivals(gender, category) {
  var grid = document.getElementById('home-na-grid');
  if (!grid) return;

  var filtered = PRODUCTS.filter(function(p) { return p.newArrival; });

  if (gender) {
    filtered = filtered.filter(function(p) { return p.gender === gender; });
  } else if (category) {
    filtered = filtered.filter(function(p) { return p.category === category; });
  }

  // Show max 8 on homepage
  filtered = filtered.slice(0, 8);

  if (filtered.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)">No new arrivals in this category yet.</div>';
    return;
  }

  var fallbackImg = 'https://aartyz.in/wp-content/uploads/2025/05/logo1-3-300x300.png';
  grid.innerHTML = filtered.map(function(p) {
    var isOnSale = p.sale && p.originalPrice > p.price;
    var badge = isOnSale
      ? '<div class="prod-badge badge-sale">Sale</div>'
      : '<div class="prod-badge badge-new">New</div>';
    var priceHTML = isOnSale
      ? '<span class="prod-original">₹' + p.originalPrice.toLocaleString('en-IN') + '</span><span class="prod-sale">₹' + p.price.toLocaleString('en-IN') + '</span>'
      : '<span class="prod-price">₹' + p.price.toLocaleString('en-IN') + '</span>';
    return '<a href="javascript:void(0)" class="prod-card-wrap" data-product-name="' + p.name + '" onclick="openProduct(this.dataset.productName)" style="display:block;text-decoration:none;color:inherit">' +
      '<div class="prod-card">' +
        '<div class="prod-img-wrap">' +
          '<img src="' + p.image + '" alt="" loading="lazy" onerror="this.src=\''+fallbackImg+'\'">' +
          badge +
          '<button class="prod-wish" onclick="event.stopPropagation();toggleWish(event,this)">♡</button>' +
          '<div class="prod-img-hover"><span class="prod-add-btn">View &amp; Buy →</span></div>' +
        '</div>' +
        '<div class="prod-meta">' +
          '<div class="prod-cat">' + p.category.replace(/_/g,' ') + ' · ' + p.subcategory.replace(/_/g,' ') + '</div>' +
          '<div class="prod-name">' + p.name + '</div>' +
          '<div class="prod-price-row">' + priceHTML + '</div>' +
        '</div>' +
      '</div>' +
    '</a>';
  }).join('');

  // Animate cards
  grid.querySelectorAll('.prod-card').forEach(function(el, i) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity .4s ease ' + (i * 60) + 'ms, transform .4s ease ' + (i * 60) + 'ms';
    setTimeout(function() {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 50);
  });
}

function filterHomeNewArrivals(btn) {
  // Update active tab
  document.querySelectorAll('#na-filter-tabs .filter-tab').forEach(function(t) {
    t.classList.remove('active');
  });
  btn.classList.add('active');

  var gender   = (btn.dataset.gender   && btn.dataset.gender   !== '') ? btn.dataset.gender   : '';
  var category = (btn.dataset.category && btn.dataset.category !== '') ? btn.dataset.category : '';
  renderHomeNewArrivals(gender, category);
}
