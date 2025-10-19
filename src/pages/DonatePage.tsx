export default function DonatePage() {
	return <div>
		<h1>Donate</h1>
		<h2>
			Your support helps keep this project alive. Every contribution makes it possible to maintain and improve the library for everyone.
		</h2>

		<form
			name="_xclick"
			action="https://www.paypal.com/cgi-bin/webscr"
			method="post"
			target="_blank"
		>
			<input type="hidden" name="cmd" value="_xclick" />
			<input
				type="hidden"
				name="business"
				value="pablobandinopla@gmail.com"
			/>
			<input type="hidden" name="currency_code" value="USD" />
			<input
				type="hidden"
				name="item_name"
				value={
					"Donation to BandiJoystick" 
				}
			/> 

			<input
				type="submit" 
				value="Donate vía PayPal"
				alt="PayPal - The safer, easier way to pay online!"
				className={"fancyBtn"}
			/>
		</form>
	</div>
}