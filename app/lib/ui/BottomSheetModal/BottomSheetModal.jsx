import React from 'react';
import PropTypes from 'prop-types';
import { classNames as cn } from 'utils';
import { useSwipeable } from 'react-swipeable';

import './BottomSheetModal.scss';

function BottomSheetModal(
  { children, className, prefix, onClose, skipSwap },
  ref
) {
  // setup ref for your usage
  const modalRef = React.useRef(null);
  const usingPosition = 20; // 30%
  const animationSpeed = 10;
  let swipedPosition = 0;
  let done = false;

  React.useEffect(() => {
    window.scrollTo(0, 0);

    if (!modalRef) return;

    document.addEventListener('click', outsideClickHandler);
    document.body.classList.add('noScroll');

    return () => {
      document.removeEventListener('click', outsideClickHandler);
      document.body.classList.remove('noScroll');
    };
  }, []);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const step = () => {
    // min 0%, max 100%
    if (swipedPosition < 0 || swipedPosition > 100) return;
    if (!modalRef || modalRef.current === null) return;
    if (done) return;

    if (swipedPosition >= usingPosition) {
      // Set position 100% in animation
      swipedPosition += animationSpeed;
      modalRef.current.style.transform = `translateY(${swipedPosition || 0}%)`;

      if (swipedPosition >= 100) {
        handleClose();
      }
    } else {
      // Set position 0% in animation.
      swipedPosition -= animationSpeed;
      swipedPosition = swipedPosition < 0 ? 0 : swipedPosition;

      modalRef.current.style.transform = `translateY(${swipedPosition || 0}%)`;
    }
    window.requestAnimationFrame(step);
  };

  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (!modalRef) return;
      if (skipSwap) return;
      if (modalRef.current.scrollTop > 0) return;

      // Cant swipe up
      if (e.deltaY < 0) return;

      // For stop animation.
      done = true;

      // Remove scroll for Modal in swiping.
      modalRef.current.style.overflowY = 'hidden';

      // Set positions
      swipedPosition = e.deltaY / (modalRef.current.offsetHeight / 100);
      modalRef.current.style.willChange = 'transform';
      modalRef.current.style.transform = `translateY(${swipedPosition || 0}%)`;
    },
    onSwiped: () => {
      done = false;
      window.requestAnimationFrame(step);

      // Add scroll for Modal after Swipe.
      if (modalRef) {
        modalRef.current.style.overflowY = 'scroll';
      }
    },
  });

  const close = () => {
    swipedPosition = usingPosition;
    window.requestAnimationFrame(step);
  };

  const outsideClickHandler = (e) => {
    e.preventDefault();

    if (!modalRef.current.contains(e.target)) {
      close();
    }
  };

  const refPassthrough = (el) => {
    // call useSwipeable ref prop with el
    handlers.ref(el);

    // set modalRef el so you can access it yourself
    modalRef.current = el;
  };

  React.useImperativeHandle(ref, () => ({
    close,
  }));

  return (
    <div
      className={cn('BottomSheetModal-container', {
        [prefix + '-Bottom-container']: prefix,
      })}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={cn('BottomSheetModal__bg', {
          [prefix + '-Bottom__bg']: prefix,
        })}
      />
      <div
        {...handlers}
        ref={refPassthrough}
        className={cn('BottomSheetModal', { [`${prefix}-Bottom`]: prefix })}
      >
        <div
          className={cn(
            'BottomSheetModal__children',
            { [prefix + '-Bottom__children']: prefix },
            { [className]: className }
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

BottomSheetModal.propTypes = {
  onClose: PropTypes.func,
  children: PropTypes.any,
  prefix: PropTypes.string,
  skipSwap: PropTypes.bool,
};

BottomSheetModal.defaultProps = {
  onClose: () => {},
  skipSwap: false,
};

const BottomSheetModalWrapper = React.forwardRef(BottomSheetModal);

export default BottomSheetModalWrapper;
