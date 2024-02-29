import React from 'react';
function Nft({id}) {
	return <svg width={20} height={20} role={'img'} viewBox="0 0 20 20">
		<clipPath id={id}>
			<path d="M14,12h6V8h-6V12z M0,12h6V8H0V12z M1,9h4v2H1V9z M0,16c0,0.55,0.45,1,1,1h5v-4
			H0V16z M19,3h-5v4h6V4C20,3.45,19.55,3,19,3z M19,6h-4V4h4V6z M0,4v3h6V3H1C0.45,3,0,3.45,0,4z M7,7h6V3H7V7z M14,17h5
			c0.55,0,1-0.45,1-1v-3h-6V17z M7,17h6v-4H7V17z M8,14h4v2H8V14z M7,12h6V8H7V12z"/>
		</clipPath>
	</svg>
}

export default Nft;
