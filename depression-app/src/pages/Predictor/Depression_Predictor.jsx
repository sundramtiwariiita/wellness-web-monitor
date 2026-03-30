import './Depression_Predictor.css'
import { useState, useEffect } from 'react';
import { getPrediction } from '../../services/Api';
import { useNavigate } from 'react-router-dom';

const Depression_Predictor = () => {

	const [result, setResult] = useState("");
	const [prediction, setPrediction] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		
		const data = window.localStorage.getItem("userInfo");
		if(!data) {
			navigate("/")
		}

		const getPred = async () => {
			const data = await getPrediction();
			setResult(data);
		}
		getPred();
	}, [])
	
	return (
		<div className="predictor-container">
			<h1>Result of the Prediction is :</h1> 	
			{
				prediction ? 
				<div>
					<p>No need to worry, breathe some fresh air and drink lots of water</p>
				</div>
				:
				<div>
					<p>Please visit any nearby clinic for consultation</p>
				</div>
			}
		</div>
	);
};

export default Depression_Predictor;