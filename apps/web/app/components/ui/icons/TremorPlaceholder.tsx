import type { SVGProps } from "react";

export const TremorPlaceholder = (props: SVGProps<SVGSVGElement>) => (
  // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
  <svg className={props.className} fill="none" viewBox="0 0 92 92" {...props}>
    <g clipPath="url(#clip0_10096_2462)">
      <mask
        id="mask0_10096_2462"
        width={92}
        height={92}
        x={0}
        y={0}
        maskUnits="userSpaceOnUse"
        style={{
          maskType: "luminance",
        }}
      >
        <path fill="white" d="M92 0H0V92H92V0Z" />
      </mask>
      <g mask="url(#mask0_10096_2462)">
        <path
          fill="#DEDEDE"
          d="M1.09521 20.809L19.7581 3.28516H72.2419L90.9047 20.809H1.09521Z"
        />
        <path fill="#C9C9C9" d="M2 20H89V88.5H2V20Z" />
        <path
          stroke="#8C8C8C"
          strokeWidth={3.28571}
          d="M17.8761 2.97375L3.49687 17.8023C2.30794 19.0283 1.64307 20.6691 1.64307 22.377V85.5C1.64307 87.7091 3.43392 89.5 5.64306 89.5H86.3574C88.5665 89.5 90.3574 87.7091 90.3574 85.5V22.8208C90.3574 20.8283 89.5817 18.9141 88.1945 17.4837L74.1244 2.97375C73.2992 2.12284 72.1646 1.64258 70.9793 1.64258H21.0211C19.8358 1.64258 18.7012 2.12284 17.8761 2.97375Z"
        />
        <path
          stroke="#8C8C8C"
          strokeWidth={3.28571}
          d="M2.19043 19.7129H90.3571"
        />
        <path
          fill="#7D7D7D"
          fillOpacity={0.8}
          d="M37.7855 3.28516H54.214L56.9521 19.7137V34.7564C56.9521 36.7315 55.3509 38.3328 53.3757 38.3328H38.6238C36.6486 38.3328 35.0474 36.7315 35.0474 34.7564V19.7137L37.7855 3.28516Z"
        />
        <path
          fill="white"
          d="M48.2744 63.3867H14.2329C12.9363 63.3867 11.8853 64.3853 11.8853 65.617V77.8837C11.8853 79.1155 12.9363 80.114 14.2329 80.114H48.2744C49.571 80.114 50.6221 79.1155 50.6221 77.8837V65.617C50.6221 64.3853 49.571 63.3867 48.2744 63.3867Z"
        />
        <path
          stroke="black"
          strokeOpacity={0.07}
          strokeWidth={1.09524}
          d="M48.1495 62.9473H14.3583C12.7495 62.9473 11.4453 64.179 11.4453 65.6985V77.8037C11.4453 79.3232 12.7495 80.5549 14.3583 80.5549H48.1495C49.7583 80.5549 51.0625 79.3232 51.0625 77.8037V65.6985C51.0625 64.179 49.7583 62.9473 48.1495 62.9473Z"
        />
        <path
          fill="#0F172A"
          d="M17.7102 75.4604C16.7747 75.4604 15.9759 74.9874 15.9759 73.7891V71.382H15.1034V70.1627H16.0284V68.7647L17.4474 68.2392V70.1627H18.5932V71.382H17.4474V73.4422C17.4474 73.9047 17.6787 74.136 18.1727 74.136C18.3304 74.136 18.4775 74.1045 18.5932 74.0729V75.3448C18.4565 75.3868 18.0781 75.4604 17.7102 75.4604ZM19.5597 75.3027V70.1627H21.0103V70.909C21.2625 70.3414 21.7355 69.9946 22.3872 69.9946C22.4923 69.9946 22.7026 70.0156 22.7656 70.0261V71.5187C22.5975 71.4766 22.4293 71.4661 22.2296 71.4661C21.6725 71.4661 21.1574 71.834 21.0313 72.3281V75.3027H19.5597ZM25.8567 75.4604C24.3746 75.4604 23.1553 74.4723 23.1553 72.6959C23.1553 71.0772 24.322 69.9946 25.7936 69.9946C27.4229 69.9946 28.3478 71.1298 28.3478 72.717C28.3478 72.8431 28.3373 73.0638 28.3268 73.1479H24.6899C24.7215 73.8522 25.3732 74.2411 26.0143 74.2411C26.7081 74.2411 27.2967 74.0519 27.9694 73.6104V74.8823C27.4964 75.1871 26.8868 75.4604 25.8567 75.4604ZM24.7215 72.1599H26.8658C26.8342 71.6764 26.4979 71.2139 25.7936 71.2139C25.1524 71.2139 24.753 71.6974 24.7215 72.1599ZM35.2192 69.9946C36.1862 69.9946 37.0586 70.6568 37.0586 71.8761V75.3027H35.587V72.244C35.587 71.6869 35.2822 71.34 34.7882 71.34C34.4203 71.34 34.126 71.5502 33.9158 71.8445V71.8761V75.3027H32.4442V72.244C32.4442 71.6869 32.1499 71.34 31.6558 71.34C31.2669 71.34 30.9726 71.5607 30.7624 71.8761V75.3027H29.2908V70.1627H30.7414V70.5727C31.0252 70.2468 31.4561 69.9946 32.1078 69.9946C32.707 69.9946 33.2641 70.2468 33.5899 70.7303C33.8527 70.4255 34.3677 69.9946 35.2192 69.9946ZM40.6916 75.4604C39.0309 75.4604 37.8957 74.2621 37.8957 72.717C37.8957 71.1823 39.0309 69.9946 40.6916 69.9946C42.3524 69.9946 43.4981 71.1823 43.4981 72.717C43.4981 74.2621 42.3524 75.4604 40.6916 75.4604ZM40.6916 74.0729C41.4064 74.0729 41.974 73.5684 41.974 72.717C41.974 71.8866 41.4064 71.3715 40.6916 71.3715C39.9874 71.3715 39.4198 71.8866 39.4198 72.717C39.4198 73.5684 39.9874 74.0729 40.6916 74.0729ZM44.4418 75.3027V70.1627H45.8923V70.909C46.1446 70.3414 46.6176 69.9946 47.2693 69.9946C47.3744 69.9946 47.5846 70.0156 47.6477 70.0261V71.5187C47.4795 71.4766 47.3113 71.4661 47.1116 71.4661C46.5545 71.4661 46.0395 71.834 45.9133 72.3281V75.3027H44.4418Z"
        />
      </g>
    </g>
    <defs>
      <clipPath id="clip0_10096_2462">
        <rect width={92} height={92} fill="white" />
      </clipPath>
    </defs>
  </svg>
);
