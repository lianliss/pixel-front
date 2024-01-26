'use strict';
import React from 'react';

class Loading extends React.PureComponent {
    render() {

        let {progress = 0.5} = this.props;
        switch (true) {
            case progress < 0: progress = 0; break;
            case progress > 1 && progress <= 100: progress /= 100; break;
            case progress > 100: progress = 0.5; break;
        }
        const duration = 1.1 - progress;
        let d20 = Math.round(19 * progress) + 1;
        if (d20 === 6 || d20 === 9) {
            d20 = `${d20}.`;
        }

        return <svg
            height="512"
            viewBox="0 0 512 512"
            width="512"
            className="ptc-icon ptc-icon-loading"
            xmlns="http://www.w3.org/2000/svg">
            <g style={
                {
                    transformOrigin: "256px 256px",
                    transform: "rotate(0deg)",
                    animation: `${duration}s linear 0.3s infinite normal forwards running tick`,
                }
            }>
                <g>
                    <g id="center">
                        <path d="m375.47 188.244-119.47 206.929-119.471-206.929z" fill="hsl(105deg 68% 93%)"/>
                    </g>
                    <g id="top">
                        <path d="m375.47 188.244-119.47-178.244-119.471 178.244z" fill="hsl(105deg 67% 85%)"/>
                    </g>
                    <g id="top-right">
                        <path d="m375.47 188.244-119.47-178.244 215.965 123.445z" fill="hsl(105deg 68% 93%)"/>
                    </g>
                    <g id="top-left">
                        <path d="m136.53 188.244 119.47-178.244-215.965 123.445z" fill="hsl(105deg 68% 93%)"/>
                    </g>
                    <g id="center-right">
                        <path d="m375.47 188.244-119.47 206.929 215.965-19.783z" fill="hsl(105deg 67% 77%)"/>
                    </g>
                    <g id="right">
                        <path d="m375.47 188.244 96.495-54.799v241.945z" fill="hsl(105deg 67% 77%)"/>
                    </g>
                    <g id="left">
                        <path d="m136.53 188.244-96.495-54.799v241.945z" fill="hsl(105deg 67% 77%)"/>
                    </g>
                    <g id="bottom-right">
                        <path d="m256 502v-106.827l215.965-19.783z" fill="hsl(105deg 67% 70%)"/>
                    </g>
                    <g id="bottom-left">
                        <path d="m256 502v-106.827l-215.965-19.783z" fill="hsl(105deg 68% 70%)"/>
                    </g>
                    <g id="center-left">
                        <path d="m136.53 188.244 119.47 206.929-215.965-19.783z" fill="hsl(105deg 67% 77%)"/>
                    </g>
                </g>
                <g>
                    {!!this.props.progress
                        ? <text x="256" y="290" className="ptc-svg-text">{d20}</text>
                        : ''}
                </g>
                <g>
                    <path d="m476.927 124.764-215.965-123.446c-3.074-1.758-6.851-1.758-9.925 0l-215.964 123.446c-3.115 1.78-5.038 5.094-5.038 8.682v241.944c0 3.549 1.881 6.832 4.942 8.627l215.965 126.61c1.562.916 3.31 1.373 5.058 1.373s3.496-.458 5.058-1.373l215.965-126.61c3.062-1.795 4.942-5.078 4.942-8.627v-241.945c0-3.588-1.923-6.901-5.038-8.681zm-426.892 25.861 73.205 41.573-73.205 141.976zm250.965 47.619h57.15l-102.15 176.929-102.15-176.929h57.15c5.523 0 10-4.477 10-10s-4.477-10-10-10h-55.729l100.729-150.283 100.729 150.283h-55.729c-5.523 0-10 4.477-10 10s4.477 10 10 10zm-63.313 185.21-181.964-16.669 81.302-157.681zm137.287-174.351 81.303 157.682-181.964 16.669zm3.633-34.141-90.576-135.135 163.734 93.59zm-245.214.001-73.157-41.546 163.734-93.59zm112.607 229.336v80.247l-162.23-95.108zm20 0 162.23-14.861-162.23 95.108zm122.76-212.102 73.205-41.573v183.55z"/>
                    <circle cx="256" cy="188.244" r="10"/>
                </g>
            </g>
        </svg>
    }
}

export default Loading;
