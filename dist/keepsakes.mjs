// One drawing specification for the live room and the exported postcard.
export const keepsakes={
 landing:{width:90,height:75,rects:[[0,0,90,20,9,'#ba9479'],[15,19,14,55,3,'#92775e'],[62,19,14,55,3,'#92775e']]},
 rescue:{width:130,height:80,rects:[[0,48,130,15,3,'#92775e'],...Array.from({length:5},(_,i)=>[11+i*20,0,15,48,2,['#879f7f','#b79679','#a395b9'][i%3]])]},
 prepare:{width:95,height:55,rects:[[0,0,95,55,16,'#ba9d6f']]}
};
export function keepsakeSvg(id){
 const k=keepsakes[id];if(!k)return '';
 return `<svg viewBox="0 0 ${k.width} ${k.height}" aria-hidden="true" focusable="false">${k.rects.map(([x,y,w,h,r,color])=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${color}"/>`).join('')}</svg>`;
}
export function drawKeepsake(c,id,x,y){
 const k=keepsakes[id];if(!k)return;
 for(const [dx,dy,w,h,r,color] of k.rects){c.fillStyle=color;c.beginPath();c.roundRect(x+dx,y+dy,w,h,r);c.fill();}
}
