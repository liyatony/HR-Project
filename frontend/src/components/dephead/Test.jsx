//  {/* ⭐ Punctuality */}
//         <div className="kpi-item">
//           <label>Punctuality</label>
//           <div className="rating-line">
//             <Rating
//               name="punctuality"
//               value={punctuality}
//               precision={0.5}
//               getLabelText={getLabelText}
//               onChange={(event, newValue) => setPunctuality(newValue || 0)}

//               onChangeActive={(event, newHover) => setHoverPunctuality(newHover)}
//             />
//             {punctuality !== null && (
//               <span className="rating-label">
//                 {labels[hoverPunctuality !== -1 ? hoverPunctuality : punctuality]}
//               </span>
//             )}
//           </div>
//         </div>

//         {/* ⭐ Teamwork */}
//         <div className="kpi-item">
//           <label>Teamwork</label>
//           <div className="rating-line">
//             <Rating
//               name="teamwork"
//               value={teamwork}
//               precision={0.5}
//               getLabelText={getLabelText}
//               onChange={(event, newValue) => setTeamwork(newValue || 0)}

//               onChangeActive={(event, newHover) => setHoverTeamwork(newHover)}
//             />
//             {teamwork !== null && (
//               <span className="rating-label">
//                 {labels[hoverTeamwork !== -1 ? hoverTeamwork : teamwork]}
//               </span>
//             )}
//           </div>
//         </div>

//         {/* ⭐ Quality */}
//         <div className="kpi-item">
//           <label>Quality</label>
//           <div className="rating-line">
//             <Rating
//               name="quality"
//               value={quality}
//               precision={0.5}
//               getLabelText={getLabelText}
//               onChange={(event, newValue) => setQuality(newValue || 0)}

//               onChangeActive={(event, newHover) => setHoverQuality(newHover)}
//             />
//             {quality !== null && (
//               <span className="rating-label">
//                 {labels[hoverQuality !== -1 ? hoverQuality : quality]}
//               </span>
//             )}
//           </div>
//         </div>