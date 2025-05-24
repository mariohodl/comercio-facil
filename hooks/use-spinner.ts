import { useEffect, useState } from 'react';

function useSpinner() {
	const [spin, setSpin] = useState(false);

	useEffect(() => {
		setSpin(false);
	}, []);

	return {
        spin,
        setSpin,
    };
}

export default useSpinner;
